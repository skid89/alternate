import { verifyAndGetSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MessageSquare, Trash2, CheckCircle2, AlertTriangle, Pin, User } from 'lucide-react';

export default async function CommentsDashboard({
  searchParams
}: {
  searchParams: { success?: string; error?: string }
}) {
  const session = await verifyAndGetSession();
  if (!session) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    include: {
      comments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!profile) {
    redirect('/login');
  }

  // Server Actions
  const approveCommentAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const commentId = formData.get('commentId') as string;

    await prisma.comment.updateMany({
      where: {
        id: commentId,
        profile: { userId: sessionAuth.userId }
      },
      data: { status: 'APPROVED' }
    });

    redirect('/dashboard/comments?success=approved');
  };

  const deleteCommentAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const commentId = formData.get('commentId') as string;

    await prisma.comment.deleteMany({
      where: {
        id: commentId,
        profile: { userId: sessionAuth.userId }
      }
    });

    redirect('/dashboard/comments?success=deleted');
  };

  const pinCommentAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const commentId = formData.get('commentId') as string;
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return;

    // Toggle pin
    await prisma.comment.updateMany({
      where: {
        id: commentId,
        profile: { userId: sessionAuth.userId }
      },
      data: { isPinned: !comment.isPinned }
    });

    redirect('/dashboard/comments?success=pinned_toggled');
  };

  const spamCommentAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const commentId = formData.get('commentId') as string;

    await prisma.comment.updateMany({
      where: {
        id: commentId,
        profile: { userId: sessionAuth.userId }
      },
      data: { status: 'SPAM' }
    });

    redirect('/dashboard/comments?success=spam');
  };

  return (
    <div className="comments-dashboard animate-fade flex flex-col gap-3">
      {searchParams.success && (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', fontSize: '14px' }}>
          ✓ Comment updated successfully.
        </div>
      )}

      <div className="glass-card flex flex-col gap-3">
        <h3>Public Comments Moderation</h3>
        <p className="text-muted" style={{ fontSize: '13px' }}>Approve, delete, pin or flag comments posted on your public Alternate profile card.</p>
        
        <div className="flex flex-col gap-2" style={{ marginTop: '16px' }}>
          {profile.comments.length === 0 ? (
            <div className="flex flex-col align-center justify-center text-muted" style={{ padding: '40px 0', gap: '8px' }}>
              <MessageSquare size={32} />
              <span>No comments have been posted to your profile yet.</span>
            </div>
          ) : (
            profile.comments.map((comment) => (
              <div 
                key={comment.id} 
                className="flex justify-between align-center" 
                style={{ 
                  padding: '16px', 
                  background: comment.status === 'PENDING' ? 'rgba(139, 92, 246, 0.03)' : 'rgba(255,255,255,0.01)', 
                  border: comment.isPinned ? '1px dashed var(--accent-color)' : '1px solid var(--card-border)', 
                  borderRadius: '12px' 
                }}
              >
                <div className="flex flex-col gap-1" style={{ fontSize: '13px' }}>
                  <div className="flex align-center gap-1" style={{ fontWeight: 600 }}>
                    <User size={14} className="text-muted" />
                    <span>{comment.authorName}</span>
                    {comment.isPinned && <Pin size={12} style={{ color: 'var(--accent-color)', fill: 'var(--accent-color)' }} />}
                    <span className="text-muted" style={{ fontSize: '10px', fontWeight: 400 }}>
                      ({new Date(comment.createdAt).toLocaleDateString()})
                    </span>
                    <span className={`premium-tag`} style={{ 
                      fontSize: '8px', 
                      background: comment.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 
                                  comment.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: comment.status === 'APPROVED' ? '#10b981' : 
                             comment.status === 'PENDING' ? '#f59e0b' : '#ef4444',
                      border: 'none',
                      marginLeft: '6px'
                    }}>
                      {comment.status.toLowerCase()}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', padding: '4px 0' }}>{comment.content}</p>
                </div>

                <div className="flex align-center gap-1">
                  {comment.status === 'PENDING' && (
                    <form action={approveCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <button type="submit" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', color: '#10b981' }}>
                        <CheckCircle2 size={12} /> Approve
                      </button>
                    </form>
                  )}
                  <form action={pinCommentAction}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }}>
                      <Pin size={12} /> Pin
                    </button>
                  </form>
                  {comment.status !== 'SPAM' && (
                    <form action={spamCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <button type="submit" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', color: '#f59e0b' }}>
                        <AlertTriangle size={12} /> Spam
                      </button>
                    </form>
                  )}
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', color: '#ef4444' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
