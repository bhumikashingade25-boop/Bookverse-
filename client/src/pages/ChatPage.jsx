import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <div className="p-8 text-center text-gray-400">Select an exchange conversation to chat.</div>;
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/exchanges')}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gold-400 font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Exchanges</span>
      </button>

      <ChatWindow exchangeId={id} />
    </div>
  );
};

export default ChatPage;
