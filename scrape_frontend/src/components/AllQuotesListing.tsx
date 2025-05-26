import React, { useState, useEffect } from 'react';
import './QuoteListing.css'
import { useParams } from 'react-router-dom';

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

  const {listingId, agentId} = useParams();

  console.log("Listing Id: ", listingId);
  console.log("Agent Id: ", agentId);

  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch(`/quotes/${listingId}/${agentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setQuotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [listingId]); // Re-run effect when listingId changes

  if (loading) return <div>Loading quotes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
  <div className="contact-page">
    <div className="contact-container">
      <h1>All Quotes</h1>
      
      {quotes.length === 0 ? (
        <div>
          <p>No quotes for your listing yet.</p>
          <p>We will notify you once we have any quotes for you.</p>
        </div>
      ) : (
        <div>
          <p>These are all the quotes you have received for your listing. You can contact the agents who give you the best price.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {quotes.map((quote) => (
              <div 
                key={`${quote.created_at}-${quote.agentContact}`} 
                style={{ 
                  background: 'white', 
                  borderRadius: '0.5rem', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                  padding: '1.25rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontWeight: '600' }}>{quote.agentName}</h2>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{quote.agentContact}</p>
                    Quote Amount: <p style={{ fontSize: '0.875rem', color: 'black' }}>£{quote.amount}</p>
                  </div>
                </div>
                
                {quote.message && (
                  <p style={{ marginTop: '0.75rem', fontStyle: 'italic' }}>"{quote.message}"</p>
                )}
                
                <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                  {formatDate(quote.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default AllQuotesListing;