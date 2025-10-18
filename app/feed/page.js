'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Plus, Send, Heart, MessageCircle, Share2, 
  Bookmark, MoreHorizontal, Loader2, Image as ImageIcon,
  Link as LinkIcon, X, ExternalLink, Crown, TrendingUp,
  Sparkles, Award
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function FeedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', link: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setCurrentUser(session.user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setCurrentUserProfile(profile);
      await loadPosts();
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          profile:profiles!feed_posts_user_id_fkey(
            id,
            full_name,
            title,
            company,
            photo_url,
            is_founding_member
          ),
          likes:feed_post_likes(count),
          comments:feed_post_comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const submitPost = async () => {
    if (!newPost.content.trim()) {
      alert('Please enter some content');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('feed_posts')
        .insert({
          user_id: currentUser.id,
          content: newPost.content.trim(),
          link: newPost.link.trim() || null
        });

      if (error) throw error;

      setShowNewPostModal(false);
      setNewPost({ content: '', link: '' });
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('feed_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('feed_post_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like
        await supabase
          .from('feed_post_likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id
          });
      }

      await loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (isLoading) {
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
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Community Feed</h1>
                <p className="text-sm text-zinc-400">Share insights, articles, and updates</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Post</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-zinc-400 mb-6">
                Be the first to share something with the community!
              </p>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => {
              const likeCount = post.likes?.[0]?.count || 0;
              const commentCount = post.comments?.[0]?.count || 0;

              return (
                <div
                  key={post.id}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 border border-zinc-800"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {post.profile?.photo_url ? (
                        <img
                          src={post.profile.photo_url}
                          alt={post.profile.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                          <span className="text-lg font-bold text-black">
                            {post.profile?.full_name?.[0] || '?'}
                          </span>
                        </div>
                      )}
                      {post.profile?.is_founding_member && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                          <Crown className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {post.profile?.full_name || 'Unknown User'}
                        </h3>
                        {post.profile?.is_founding_member && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                            Founding Member
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400">
                        {post.profile?.title} at {post.profile?.company}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(post.created_at).toLocaleDateString()} at{' '}
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Actions Menu */}
                    <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-zinc-200 leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Link Preview */}
                  {post.link && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-amber-500/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-sm text-amber-400 group-hover:text-amber-300">
                        <LinkIcon className="w-4 h-4" />
                        <span className="truncate">{post.link}</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                    </a>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-zinc-800">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors group"
                    >
                      <Heart className="w-5 h-5 group-hover:fill-amber-400" />
                      <span className="text-sm font-semibold">{likeCount}</span>
                    </button>

                    <button className="flex items-center gap-2 text-zinc-400 hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">{commentCount}</span>
                    </button>

                    <button className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors ml-auto">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold mb-6">Create a Post</h2>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-3">
                {currentUserProfile?.photo_url ? (
                  <img
                    src={currentUserProfile.photo_url}
                    alt={currentUserProfile.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-black">
                      {currentUserProfile?.full_name?.[0] || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">{currentUserProfile?.full_name}</div>
                  <div className="text-sm text-zinc-400">
                    {currentUserProfile?.title} at {currentUserProfile?.company}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, insights, or an interesting article..."
                  rows={8}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500 resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  {newPost.content.length}/1000 characters
                </p>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium mb-2">Link (optional)</label>
                <input
                  type="url"
                  value={newPost.link}
                  onChange={(e) => setNewPost({ ...newPost, link: e.target.value })}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={submitPost}
                disabled={submitting || !newPost.content.trim()}
                className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}