import React, { useState } from 'react';
import { Comment, Reply, BeneficiaryProfile } from '../types';
import { Send, RefreshCw, Trash2, ArrowDownLeft, CornerDownLeft, UserCircle, Shield, Heart, MessageCircle } from 'lucide-react';

interface SolidarityCommentsProps {
  comments?: Comment[];
  onAddComment: (authorName: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onAddReply: (commentId: string, authorName: string, text: string) => Promise<void>;
  onDeleteReply: (commentId: string, replyId: string) => Promise<void>;
  language: 'ar' | 'en';
  currentBeneficiary: BeneficiaryProfile | null;
  postOwnerId?: string; // To let the family delete any comments on their own post
}

export const SolidarityComments: React.FC<SolidarityCommentsProps> = ({
  comments = [],
  onAddComment,
  onDeleteComment,
  onAddReply,
  onDeleteReply,
  language,
  currentBeneficiary,
  postOwnerId
}) => {
  const isEn = language === 'en';
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<{ [commentId: string]: string }>({});
  const [replyNameMap, setReplyNameMap] = useState<{ [commentId: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    let finalName = commentName.trim();
    if (currentBeneficiary) {
      finalName = currentBeneficiary.name;
    } else if (!finalName) {
      finalName = isEn ? 'Benevolent visitor' : 'فاعل خير متضامن';
    }

    try {
      await onAddComment(finalName, commentText);
      setCommentText('');
      setCommentName('');
      setShowAddForm(false); // Automatically compress when sent successfully
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (commentId: string) => {
    const text = replyTextMap[commentId] || '';
    if (!text.trim()) return;

    let finalName = (replyNameMap[commentId] || '').trim();
    if (currentBeneficiary) {
      finalName = currentBeneficiary.name;
    } else if (!finalName) {
      finalName = isEn ? 'Benevolent visitor' : 'فاعل خير متضامن';
    }

    try {
      await onAddReply(commentId, finalName, text);
      setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
      setReplyNameMap(prev => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Determine if a user has permission to delete a comment/reply
  // ONLY allowed if:
  // 1. The currently logged-in family is the post owner (the survivor who created the daily update or need)
  // 2. The currently logged-in family is the author of that comment/reply
  // Visitors can NEVER delete.
  const canDelete = (authorId?: string) => {
    if (!currentBeneficiary) return false; // Visitors cannot delete anything
    if (currentBeneficiary.id === postOwnerId) return true; // Post owner can delete any comment
    if (authorId && currentBeneficiary.id === authorId) return true; // Author can delete
    return false; // Other families can't delete either
  };

  return (
    <div className="mt-6 border-t border-slate-100 bg-slate-50/40 p-4 sm:p-6 duration-200 rounded-b-3xl space-y-6 text-start" id="solidarity_comment_section">
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
          <span>{isEn ? 'Solidarity Log & Comments' : 'سجل المؤازرة والتعليقات'}</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono font-bold">
            {comments.length}
          </span>
        </h4>

        {/* Toggle Button to open comment box, preserving space */}
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
            showAddForm
              ? 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white shadow-xs'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{showAddForm ? (isEn ? 'Close Form' : 'إغلاق الكتابة') : (isEn ? 'Add Comment' : 'كتابة تعليق')}</span>
        </button>
      </div>

      {/* Main Comment Form */}
      {showAddForm && (
        <form onSubmit={handlePostComment} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-3xs animate-fadeIn">
          {currentBeneficiary ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-100 font-bold max-w-max">
              <Heart className="w-3.5 h-3.5 fill-emerald-500 animate-pulse text-emerald-500" />
              <span>
                {isEn ? `Posting verified as "${currentBeneficiary.name}" (Family)` : `معرّف تلقائياً بصفتك: "${currentBeneficiary.name}" (العائلة)`}
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={isEn ? "Your name (optional)" : "اسمك الكريم (اختياري)"}
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 w-full font-medium"
              />
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              placeholder={isEn ? "Write a supportive word, reply, or inquiry..." : "اكتب كلمة طيبة، دعاء، مؤازرة، أو استفسار عيني..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              className="px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 w-full font-medium resize-none text-start text-slate-800"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isEn ? 'Comment' : 'أضف تعليق'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Comment Feed */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-slate-400 py-4 text-xs font-medium">
            {isEn ? 'No comments left yet. Write the first message!' : 'لا توجد تعليقات حتى الآن. كن أول من يترك كلمة طيبة!'}
          </p>
        ) : (
          comments.map((comment) => {
            const isFamilyComment = comment.authorRole === 'family';
            return (
              <div key={comment.id} className="bg-white border border-slate-150 p-4 rounded-2xl shadow-3xs space-y-3" id={`comment_${comment.id}`}>
                {/* Comment Metadata */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-full ${isFamilyComment ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {comment.authorName}
                        </span>
                        {isFamilyComment && (
                          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                            <Shield className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                            {isEn ? 'Verified Family' : 'العائلة المستفيدة'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        {comment.createdAt}
                      </span>
                    </div>
                  </div>

                  {canDelete(comment.authorId) && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title={isEn ? "Delete comment" : "حذف التعليق"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-2 pr-2 whitespace-pre-wrap text-start">
                  {comment.text}
                </p>

                {/* Actions: reply, replyCount */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-50">
                  <button
                    onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                    className="text-[11px] font-extrabold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Reply' : 'رد'}</span>
                  </button>

                  {(comment.replies && comment.replies.length > 0) && (
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {comment.replies.length} {isEn ? 'replies' : 'ردود'}
                    </span>
                  )}
                </div>

                {/* Inline Nested Reply Form */}
                {activeReplyId === comment.id && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-2 space-y-2 max-w-xl">
                    {!currentBeneficiary && (
                      <input
                        type="text"
                        placeholder={isEn ? "Your name (optional)" : "اسمك الكريم (اختياري)"}
                        value={replyNameMap[comment.id] || ''}
                        onChange={(e) => setReplyNameMap(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-emerald-600 w-full font-medium"
                      />
                    )}
                    <div className="flex gap-2">
                      <textarea
                        placeholder={isEn ? "Write your reply/defense..." : "اكتب ردك ومؤازرتك هنا..."}
                        value={replyTextMap[comment.id] || ''}
                        onChange={(e) => setReplyTextMap(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        rows={2}
                        className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-emerald-600 w-full font-medium resize-none text-slate-700"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className="text-[10px] sm:text-xs font-bold text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
                      >
                        {isEn ? 'Cancel' : 'إلغاء'}
                      </button>
                      <button
                        onClick={() => handlePostReply(comment.id)}
                        disabled={!(replyTextMap[comment.id]?.trim())}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-lg transition"
                      >
                        {isEn ? 'Send Reply' : 'إرسال الرد'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies Rendering */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-4 pr-1 sm:pl-6 border-l-2 rtl:border-l-0 rtl:border-r-2 border-emerald-100 space-y-3 mt-2 pt-1">
                    {comment.replies.map((reply) => {
                      const isFamilyReply = reply.authorRole === 'family';
                      return (
                        <div key={reply.id} className="bg-slate-50/70 p-2.5 sm:p-3 rounded-xl border border-slate-100 text-start space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-800">
                                {reply.authorName}
                              </span>
                              {isFamilyReply && (
                                <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-extrabold px-1 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
                                  {isEn ? 'Family' : 'العائلة'}
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 font-mono">
                                {reply.createdAt}
                              </span>
                            </div>
                            {canDelete(reply.authorId) && (
                              <button
                                onClick={() => onDeleteReply(comment.id, reply.id)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition"
                                title={isEn ? "Delete reply" : "حذف الرد"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                            {reply.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
