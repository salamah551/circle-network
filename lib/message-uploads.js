// Message File Upload Utilities
// TO COMPLETE BUG #3: Integrate this into app/messages/page.js

import { supabase } from './supabase';

/**
 * Upload a file to Supabase storage and create attachment record
 * @param {File} file - The file to upload
 * @param {string} messageId - The message ID to attach to
 * @param {string} userId - The current user ID
 * @returns {Promise<{url: string, attachmentId: string}>}
 */
export async function uploadMessageAttachment(file, messageId, userId) {
  try {
    // Create unique file path: userId/messageId/filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${messageId}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Generate signed URL (valid for 1 year)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (signedError) throw signedError;

    // Save attachment record to database
    const { data: attachment, error: dbError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        file_url: signedData.signedUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      url: signedData.signedUrl,
      attachmentId: attachment.id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Load attachments for a message
 * @param {string} messageId
 * @returns {Promise<Array>}
 */
export async function getMessageAttachments(messageId) {
  const { data, error } = await supabase
    .from('message_attachments')
    .select('*')
    .eq('message_id', messageId);

  if (error) {
    console.error('Error loading attachments:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete an attachment
 * @param {string} attachmentId
 * @param {string} fileUrl
 */
export async function deleteMessageAttachment(attachmentId, fileUrl) {
  try {
    // Extract file path from URL
    const filePath = fileUrl.split('/message-attachments/')[1];
    
    // Delete from storage
    await supabase.storage
      .from('message-attachments')
      .remove([filePath]);

    // Delete database record
    await supabase
      .from('message_attachments')
      .delete()
      .eq('id', attachmentId);

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

// INTEGRATION STEPS FOR app/messages/page.js:
//
// 1. Import this utility:
//    import { uploadMessageAttachment, getMessageAttachments } from '@/lib/message-uploads';
//
// 2. Add file input state:
//    const [selectedFile, setSelectedFile] = useState(null);
//    const fileInputRef = useRef(null);
//
// 3. Add file handler to sendMessage function:
//    if (selectedFile) {
//      const { url } = await uploadMessageAttachment(selectedFile, data.id, currentUser.id);
//      console.log('File uploaded:', url);
//    }
//
// 4. Add file input UI before the send button:
//    <input
//      ref={fileInputRef}
//      type="file"
//      accept="image/*"
//      onChange={(e) => setSelectedFile(e.target.files[0])}
//      className="hidden"
//    />
//    <button onClick={() => fileInputRef.current?.click()}>
//      <ImageIcon className="w-5 h-5" />
//    </button>
//
// 5. Load and display attachments in messages:
//    In the message display section, check for attachments and render images
