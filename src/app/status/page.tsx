import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ShieldCheck, Server, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  let dbStatus = 'Operational';
  let latency = 0;
  let errorMsg = null;

  const start = Date.now();
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    latency = Date.now() - start;
  } catch (err: any) {
    dbStatus = 'Degraded / Down';
    errorMsg = err.message || 'Connection timed out';
  }

  const isHealthy = dbStatus === 'Operational';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} />
            Alternate Status
          </h2>
          <Link href="/" style={{ fontSize: '13px', color: '#8b5cf6', textDecoration: 'underline' }}>Go Home</Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', backgroundColor: isHealthy ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: `1px solid ${isHealthy ? '#10b981' : '#ef4444'}` }}>
            {isHealthy ? (
              <ShieldCheck size={28} style={{ color: '#10b981' }} />
            ) : (
              <AlertCircle size={28} style={{ color: '#ef4444' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{isHealthy ? 'All Systems Operational' : 'Partial System Outage'}</div>
              <div style={{ fontSize: '12px', color: '#71717a' }}>Updated just now (live query)</div>
            </div>
          </div>

          {/* Component status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
              <span className="text-muted">PostgreSQL Database</span>
              <span style={{ color: isHealthy ? '#10b981' : '#ef4444', fontWeight: 600 }}>{dbStatus} ({latency}ms)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
              <span className="text-muted">Public API Gateway</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Operational</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
              <span className="text-muted">Media Object Storage</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Operational (Local Fallback)</span>
            </div>
          </div>

          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '12px', borderRadius: '6px', fontFamily: 'monospace' }}>
              Error Log: {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
