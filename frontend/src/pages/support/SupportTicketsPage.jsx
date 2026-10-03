import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Check
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { AppModal } from '../../components/common/AppModal';
import { FormInput, FormSelect, FormTextarea } from '../../components/common/FormField';
import { supportApi } from '../../api/supportApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SupportTicketsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // New ticket form
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'behaviour',
    priority: 'normal',
    message: ''
  });

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await supportApi.getTickets();
      setTickets(res.data?.items || res.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load support tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await supportApi.createTicket(ticketForm);
      addToast('Inquiry ticket submitted successfully', 'success');
      setIsNewModalOpen(false);
      setTicketForm({ subject: '', category: 'behaviour', priority: 'normal', message: '' });
      loadTickets();
    } catch (err) {
      addToast(err.message || 'Failed to submit inquiry', 'error');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSubmittingReply(true);
    try {
      await supportApi.replyTicket(selectedTicket.id, { message: replyText });
      addToast('Reply submitted', 'success');
      setReplyText('');
      // Reload tickets and update selected ticket view
      const res = await supportApi.getTickets();
      const updatedList = res.data?.items || res.data || [];
      setTickets(updatedList);
      const current = updatedList.find(t => t.id === selectedTicket.id);
      if (current) setSelectedTicket(current);
    } catch (err) {
      addToast(err.message || 'Failed to send reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await supportApi.updateTicketStatus(ticketId, { status });
      addToast(`Ticket status changed to ${status}`, 'success');
      loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status }));
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const isStaff = ['admin', 'administrator', 'principal', 'teacher', 'staff'].includes(user?.role?.name?.toLowerCase());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Clarification Desk"
        subtitle="Submit queries, follow up with teachers or administrators regarding attendance and behavior records"
        action={
          <Button icon={Plus} onClick={() => setIsNewModalOpen(true)}>
            New Inquiry Ticket
          </Button>
        }
      />

      {loading ? (
        <LoadingState message="Loading support threads..." />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No Support Inquiries"
          description="There are currently no active clarification tickets. Click the button above to start a conversation with the school staff."
          actionText="Create Inquiry"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-neutral-400">
                    #{t.ticket_number || `TCK-${t.id}`}
                  </span>
                  <StatusBadge status={t.status || 'open'} />
                </div>
                <h3 className="font-bold text-neutral-900 text-base mb-1 line-clamp-2">
                  {t.subject}
                </h3>
                <p className="text-xs text-neutral-500 mb-3 capitalize">
                  Category: <span className="font-semibold text-neutral-700">{t.category || 'General'}</span>
                </p>
                <p className="text-sm text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
                  {t.message || t.description}
                </p>
              </div>

              <div className="border-t border-neutral-100 pt-3">
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {t.user?.full_name || 'Requester'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  icon={MessageSquare}
                  onClick={() => setSelectedTicket(t)}
                >
                  View Discussion ({t.replies?.length || 0})
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Ticket */}
      <AppModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Submit Support Inquiry"
        size="md"
        onConfirm={handleCreateTicket}
        confirmText="Submit Inquiry"
        cancelText="Cancel"
      >
        <form id="ticket-form" onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FormInput
            label="Subject / Topic"
            placeholder="e.g. Clarification regarding attendance marking on 24th Sept"
            value={ticketForm.subject}
            onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <FormSelect
              label="Category"
              value={ticketForm.category}
              onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              placeholder={null}
              required
              options={[
                { value: 'behaviour', label: 'Behaviour & Conduct' },
                { value: 'attendance', label: 'Attendance Discrepancy' },
                { value: 'academic', label: 'Academic / Homework' },
                { value: 'general', label: 'General Institution Query' }
              ]}
            />

            <FormSelect
              label="Priority"
              value={ticketForm.priority}
              onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
              placeholder={null}
              required
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />
          </div>

          <FormTextarea
            label="Detailed Explanation"
            placeholder="Describe your query or request for clarification in detail..."
            value={ticketForm.message}
            onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
            required
            rows={4}
          />
        </form>
      </AppModal>

      {/* Modal: View Ticket Discussion */}
      {selectedTicket && (
        <AppModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket: ${selectedTicket.subject}`}
          size="lg"
          showFooter={false}
        >
          <div className="space-y-6">
            {/* Ticket Header Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTicket.status || 'open'} />
                <span className="text-xs text-neutral-500">
                  Opened by <strong className="text-neutral-800">{selectedTicket.user?.full_name || 'User'}</strong>
                </span>
              </div>
              {isStaff && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Update Status:</span>
                  <select
                    value={selectedTicket.status || 'open'}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 bg-white border border-neutral-300 rounded-md outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Original message */}
            <div className="p-4 bg-primary-50/40 rounded-xl border border-primary-100">
              <p className="text-xs font-bold text-primary-900 mb-1">Original Request:</p>
              <p className="text-sm text-neutral-800 leading-relaxed">{selectedTicket.message || selectedTicket.description}</p>
            </div>

            {/* Thread Replies */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Conversation Thread ({selectedTicket.replies?.length || 0})
              </h4>
              {(!selectedTicket.replies || selectedTicket.replies.length === 0) ? (
                <p className="text-xs text-neutral-400 italic py-2">No responses recorded yet.</p>
              ) : (
                selectedTicket.replies.map((reply, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-sm ${
                      reply.user_id === user?.id
                        ? 'bg-neutral-50 border-neutral-200 ml-6'
                        : 'bg-primary-50 border-primary-200 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                      <span className="font-semibold text-neutral-800">
                        {reply.user?.full_name || (reply.user_id === user?.id ? 'You' : 'Staff Member')}
                      </span>
                      <span>{reply.created_at ? new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed">{reply.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post Reply */}
            {selectedTicket.status !== 'closed' && (
              <form onSubmit={handleSendReply} className="pt-2 border-t border-neutral-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type your reply or clarification..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                  />
                  <Button type="submit" loading={submittingReply} icon={Send}>
                    Send
                  </Button>
                </div>
              </form>
            )}
          </div>
        </AppModal>
      )}
    </div>
  );
};
