'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Send, Heart, MessageCircle, Share2,
  Bookmark, MoreHorizontal, Loader2, Image as ImageIcon,
  Link as LinkIcon, X, ExternalLink, Crown, Trash2, Smile, Upload
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase'; // shared singleton to avoid multiple GoTrue clients

const MAX_IMAGES = 4;
const BUCKET = 'feed-attachments';

export default function FeedPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);            // session.user
  const [profile, setProfile] = useState(null);  // my profile
  const [posts, setPosts] = useState([]);

  const [showComposer, setShowComposer] = useState(false);
  const [submitPosting, setSubmitPosting] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    link: '',
    files: [],         // File[]
    filePreviews: []   // local preview URLs
  });

  // Comments state
  const [openComments, setOpenComments] = useState({}); // postId -> boolean
  const [comments, setComments] = useState({});         // postId -> array
  const [commentInputs, setCommentInputs] = useState({});// postId -> text
  const [commentBusy, setCommentBusy] = useState({});    // postId -> boolean

  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        if (!mounted) return;

        setMe(session.user);

        const { data: myProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!mounted) return;
        setProfile(myProfile || null);

        await loadPosts();

        // realtime subscriptions
        const channel = supabase.channel('feed-realtime');

        channel
          .on('postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'feed_posts' },
              (payload) => {
                setPosts((prev) => {
                  const exists = prev.find((p) => p.id === payload.new.id);
                  if (exists) return prev;
                  // hydrate profile for new post
                  return [mapRowToPost(payload.new, null, null, null, null), ...prev];
                });
              })
          .on('postgres_changes',
              { event: '*', schema: 'public', table: 'feed_post_likes' },
              async (_payload) => {
                // refresh counts quickly (could optimize by adjusting counts locally)
                await loadPosts(true);
              })
          .on('postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'feed_post_comments' },
              (payload) => {
                // If the post thread is open, append; otherwise refresh counts only
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === payload.new.post_id
                      ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
                      : p
                  )
                );
                if (openComments[payload.new.post_id]) {
                  // pull the single new comment with profile
                  supabase
                    .from('profiles')
                    .select('id, full_name, title, company, photo_url, is_founding_member')
                    .eq('id', payload.new.user_id)
                    .single()
                    .then(({ data: commenter }) => {
                      setComments((prev) => {
                        const arr = prev[payload.new.post_id] || [];
                        return {
                          ...prev,
                          [payload.new.post_id]: [
                            ...arr,
                            {
                              ...payload.new,
                              profile: commenter || null
                            }
                          ]
                        };
                      });
                    });
                }
              })
          .subscribe();

        setLoading(false);

        return () => {
          channel.unsubscribe();
        };
      } catch (e) {
        console.error('Feed init error:', e);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  const loadPosts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          profile:profiles!feed_posts_user_id_fkey(
            id, full_name, title, company, photo_url, is_founding_member
          ),
          likes:feed_post_likes(count),
          comments:feed_post_comments(count),
          attachments:feed_post_attachments(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading feed:', error);
        if (!silent) setLoading(false);
        return;
      }

      const mapped = (data || []).map((row) => mapRowToPost(row));
      setPosts(mapped);
      if (!silent) setLoading(false);
    } catch (e) {
      console.error('Unexpected error loading feed:', e);
      if (!silent) setLoading(false);
    }
  };

  const mapRowToPost = (row) => {
    // Support mapping both SELECT shape and INSERT payload
    const likeCount = Array.isArray(row.likes) ? row.likes[0]?.count || 0 : row.likeCount || 0;
    const commentCount = Array.isArray(row.comments) ? row.comments[0]?.count || 0 : row.commentsCount || 0;
    const attachments = row.attachments || [];
    return {
      id: row.id,
      user_id: row.user_id,
      profile: row.profile || null,
      content: row.content || '',
      link: row.link || '',
      created_at: row.created_at,
      likeCount,
      commentCount,
      attachments
    };
  };

  const isMyPost = (post) => me && post.user_id === me.id;

  // Composer handlers
  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const images = files.filter((f) => f.type.startsWith('image/'));
    const capped = [...newPost.files, ...images].slice(0, MAX_IMAGES);
    const previews = capped.map((f) => URL.createObjectURL(f));

    setNewPost((s) => ({ ...s, files: capped, filePreviews: previews }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePreview = (i) => {
    setNewPost((s) => {
      const files = [...s.files];
      const previews = [...s.filePreviews];
      files.splice(i, 1);
      previews.splice(i, 1);
      return { ...s, files, filePreviews: previews };
    });
  };

  const uploadAttachments = async (postId) => {
    if (!newPost.files.length) return [];

    const uploads = [];
    for (const file of newPost.files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const key = `${me.id}/${postId}/${uuidv4()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
      if (upErr) {
        console.error('Upload error:', upErr);
        continue;
      }
      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
      const url = publicUrlData?.publicUrl;
      if (url) uploads.push({ key, url, type: 'image' });
    }

    if (uploads.length) {
      const rows = uploads.map((u) => ({
        post_id: postId,
        url: u.url,
        file_key: u.key,
        type: u.type
      }));
      const { error: insErr } = await supabase.from('feed_post_attachments').insert(rows);
      if (insErr) {
        console.error('Attachment insert error:', insErr);
      }
    }

    return uploads;
  };

  const submitPost = async () => {
    if (!newPost.content.trim() && !newPost.files.length && !newPost.link.trim()) {
      alert('Write something or add an attachment');
      return;
    }
    if (!me) return;
    setSubmitPosting(true);
    try {
      const { data: inserted, error } = await supabase
        .from('feed_posts')
        .insert({
          user_id: me.id,
          content: newPost.content.trim(),
          link: newPost.link.trim() || null
        })
        .select('*')
        .single();

      if (error) throw error;

      // Upload attachments if any
      await uploadAttachments(inserted.id);

      // Reset composer
      setNewPost({ content: '', link: '', files: [], filePreviews: [] });
      setShowComposer(false);

      // Refresh feed
      await loadPosts(true);
    } catch (e) {
      console.error('Error creating post:', e);
      alert('Failed to create post');
    } finally {
      setSubmitPosting(false);
    }
  };

  const toggleLike = async (post) => {
    try {
      if (!me) return;

      // Check if I already liked
      const { data: existing } = await supabase
        .from('feed_post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', me.id)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from('feed_post_likes').delete().eq('id', existing.id);
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p))
        );
      } else {
        await supabase.from('feed_post_likes').insert({ post_id: post.id, user_id: me.id });
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, likeCount: (p.likeCount || 0) + 1 } : p))
        );
      }
    } catch (e) {
      console.error('Like toggle error:', e);
    }
  };

  const openThread = async (postId) => {
    const isOpen = openComments[postId];
    setOpenComments((s) => ({ ...s, [postId]: !isOpen }));
    if (isOpen) return;

    // load comments
    try {
      const { data, error } = await supabase
        .from('feed_post_comments')
        .select(`
          *,
          profile:profiles!feed_post_comments_user_id_fkey(
            id, full_name, title, company, photo_url, is_founding_member
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((s) => ({ ...s, [postId]: data || [] }));
    } catch (e) {
      console.error('Error loading comments:', e);
      setComments((s) => ({ ...s, [postId]: [] }));
    }
  };

  const submitComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    setCommentBusy((s) => ({ ...s, [postId]: true }));
    try {
      await supabase.from('feed_post_comments').insert({
        post_id: postId,
        user_id: me.id,
        content: text
      });
      setCommentInputs((s) => ({ ...s, [postId]: '' }));
      // realtime handler bumps count and appends new comment if open
    } catch (e) {
      console.error('Error submitting comment:', e);
      alert('Failed to reply');
    } finally {
      setCommentBusy((s) => ({ ...s, [postId]: false }));
    }
  };

  const timeLabel = (ts) =>
    new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Render
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Community Feed</h1>
              <p className="text-sm text-zinc-400">Share insights, opportunities, and updates</p>
            </div>
          </div>

          <button
            onClick={() => setShowComposer(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Post</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        {/* Composer modal */}
        {showComposer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative">
              <button
                onClick={() => setShowComposer(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                {profile?.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name || 'You'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold">
                    {profile?.full_name?.[0] || 'Y'}
                  </div>
                )}

                <div className="flex-1">
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost((s) => ({ ...s, content: e.target.value }))}
                    placeholder="What's happening?"
                    rows={6}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                    maxLength={1000}
                  />
                  <div className="text-xs text-zinc-500 mt-1">
                    {newPost.content.length}/1000
                  </div>

                  {/* Link field */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Optional link</label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center gap-2 flex-1">
                        <LinkIcon className="w-4 h-4 text-zinc-400" />
                        <input
                          type="url"
                          value={newPost.link}
                          onChange={(e) => setNewPost((s) => ({ ...s, link: e.target.value }))}
                          placeholder="https://example.com/article"
                          className="bg-transparent outline-none flex-1 text-white placeholder-zinc-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">Attachments</label>
                      <span className="text-xs text-zinc-500">{newPost.files.length}/{MAX_IMAGES} images</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Add images
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onPickFiles}
                        className="hidden"
                      />
                    </div>

                    {/* Previews */}
                    {newPost.filePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {newPost.filePreviews.map((src, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-700">
                            <img src={src} alt={`attachment-${idx}`} className="w-full h-32 object-cover" />
                            <button
                              onClick={() => removePreview(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowComposer(false)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white"
                      disabled={submitPosting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitPost}
                      disabled={submitPosting || (!newPost.content.trim() && !newPost.files.length && !newPost.link.trim())}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-semibold rounded-lg flex items-center gap-2"
                    >
                      {submitPosting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Publish
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed list */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-zinc-400 mb-6">Be the first to share something with the community.</p>
              <button
                onClick={() => setShowComposer(true)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => <PostCard
              key={post.id}
              post={post}
              me={me}
              onLike={() => toggleLike(post)}
              onOpenThread={() => openThread(post.id)}
              isThreadOpen={!!openComments[post.id]}
              comments={comments[post.id] || []}
              commentInput={commentInputs[post.id] || ''}
              setCommentInput={(val) => setCommentInputs((s) => ({ ...s, [post.id]: val }))}
              onSubmitComment={() => submitComment(post.id)}
              commentBusy={!!commentBusy[post.id]}
            />)
          )}
        </div>
      </main>
    </div>
  );
}

function PostCard({
  post, me, onLike, onOpenThread, isThreadOpen,
  comments, commentInput, setCommentInput, onSubmitComment, commentBusy
}) {
  const isMine = me && post.user_id === me.id;

  const initials = useMemo(() => {
    const name = post.profile?.full_name || '';
    return (name[0] || 'U').toUpperCase();
  }, [post.profile?.full_name]);

  const attachmentGridCols = post.attachments?.length === 1 ? 'grid-cols-1' :
                              post.attachments?.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3';

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {post.profile?.photo_url ? (
              <img
                src={post.profile.photo_url}
                alt={post.profile.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold">
                {initials}
              </div>
            )}
            {post.profile?.is_founding_member && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                <Crown className="w-3 h-3 text-black" />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{post.profile?.full_name || 'Member'}</span>
                  {post.profile?.is_founding_member && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                      Founding Member
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500">
                  {post.profile?.title && post.profile?.company
                    ? `${post.profile.title} at ${post.profile.company} • `
                    : ''}
                  {new Date(post.created_at).toLocaleDateString()} at{' '}
                  {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            {post.content && (
              <p className="text-zinc-200 leading-relaxed mt-3 whitespace-pre-wrap">
                {post.content}
              </p>
            )}

            {/* Link preview (simple) */}
            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-amber-500/50 transition-colors group"
              >
                <div className="flex items-center gap-2 text-sm text-amber-400 group-hover:text-amber-300">
                  <LinkIcon className="w-4 h-4" />
                  <span className="truncate">{post.link}</span>
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </div>
              </a>
            )}

            {/* Attachments */}
            {post.attachments?.length > 0 && (
              <div className={`mt-4 grid ${attachmentGridCols} gap-2`}>
                {post.attachments.map((att) => (
                  <div key={att.id} className="rounded-lg overflow-hidden border border-zinc-800">
                    {/* images only for now */}
                    <img src={att.url} alt="attachment" className="w-full h-56 object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-6 text-zinc-400">
              <button onClick={onLike} className="flex items-center gap-2 hover:text-amber-400 transition-colors group">
                <Heart className="w-5 h-5 group-hover:fill-amber-400" />
                <span className="text-sm">{post.likeCount || 0}</span>
              </button>

              <button onClick={onOpenThread} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.commentCount || 0}</span>
              </button>

              <button className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Comments thread */}
            {isThreadOpen && (
              <div className="mt-5 pt-5 border-t border-zinc-800 space-y-4">
                {comments.length === 0 ? (
                  <div className="text-sm text-zinc-500">No replies yet. Be the first to comment.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      {/* commenter avatar */}
                      {c.profile?.photo_url ? (
                        <img
                          src={c.profile.photo_url}
                          alt={c.profile.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                          {(c.profile?.full_name?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-zinc-500">
                          <span className="text-zinc-300 font-medium">{c.profile?.full_name || 'Member'}</span>
                          <span> • {new Date(c.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="text-sm text-zinc-200 whitespace-pre-wrap mt-1">{c.content}</div>
                      </div>
                    </div>
                  ))
                )}

                {/* add comment */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black text-xs font-bold">
                    {(post.profile?.full_name?.[0] || 'Y').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                        maxLength={500}
                      />
                      <button
                        onClick={onSubmitComment}
                        disabled={commentBusy || !commentInput.trim()}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-semibold rounded-lg flex items-center gap-2"
                      >
                        {commentBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span className="hidden sm:inline">Reply</span>
                      </button>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{commentInput.length}/500</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}