import React, { useState } from 'react';
import './QuoteListing.css'

interface Quote {
  agentName: string;
  agentContact: string;
  amount: number;
  message: string | null;
  created_at: string;
}

const AllQuotesListing: React.FC = () => {

  const formatDate = (created_at: string) => {
    return new Date(created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Dummy data - replace with API call later
  const [quotes] = useState<Quote[]>([
    {
      agentName: 'Acme Corporation',
      agentContact: 'BuildIt Construction',
      amount: 12500,
      message: 'Test message',
      created_at: '2023-06-15'
    },
    {
      agentName: 'Acme Corporation',
      agentContact: 'BuildIt Construction',
      amount: 12500,
      message: 'Test message',
      created_at: '2023-06-15'
    },
    {
      agentName: 'Acme Corporation',
      agentContact: 'BuildIt Construction',
      amount: 12500,
      message: 'Test message',
      created_at: '2023-06-15'
    }
  ]);

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Received Quotes
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {quotes.map((quote) => (
          <div key={quote.created_at} style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontWeight: '600' }}>{quote.agentName}</h2>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{quote.agentContact}</p>
              </div>
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
                ${quote.amount}
              </span>
            </div>
            {quote.message && <p style={{ marginTop: '0.75rem', fontStyle: 'italic' }}>"{quote.message}"</p>}
            <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
              {formatDate(quote.created_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

};

export default AllQuotesListing;