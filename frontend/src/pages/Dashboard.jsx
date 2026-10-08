import React, { useState, useEffect, useRef } from 'react';
import {
  Power, Activity, Thermometer, Zap, BatteryCharging, Clock,
  Radio, RefreshCw, Trash2, Download, Search, Wind, Lightbulb,
  AirVent, Tv, Cpu, Wifi
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SensorOscilloscope from '../components/SensorOscilloscope';

// ─── Component definitions with wattage ranges ──────────────────────────────
const COMPONENTS = [
  { id: 'ac',      label: 'Air Conditioner', icon: AirVent,   baseWatts: 1500, onColor: '#06b6d4', unit: 'W' },
  { id: 'fan',     label: 'Ceiling Fan',      icon: Wind,      baseWatts: 75,   onColor: '#a855f7', unit: 'W' },
  { id: 'light',   label: 'LED Lights',       icon: Lightbulb, baseWatts: 40,   onColor: '#f59e0b', unit: 'W' },
  { id: 'tv',      label: 'Smart TV',         icon: Tv,        baseWatts: 120,  onColor: '#ec4899', unit: 'W' },
  { id: 'cpu',     label: 'Server / CPU',     icon: Cpu,       baseWatts: 250,  onColor: '#10b981', unit: 'W' },
  { id: 'router',  label: 'Wi-Fi Router',     icon: Wifi,      baseWatts: 15,   onColor: '#f97316', unit: 'W' },
];

// ─── Simulate fluctuating wattage ──────────────────────────────────────────
function simulateWatts(base, active) {
  if (!active) return (Math.random() * 3).toFixed(1); // standby ~0–3W
  const variation = base * 0.08; // ±8% fluctuation
  return (base + (Math.random() - 0.5) * variation * 2).toFixed(1);
}

// ─── Voltage gauge mini-component ─────────────────────────────────────────
function PowerGauge({ watts, maxWatts, color }) {
  const pct = Math.min((watts / maxWatts) * 100, 100);
  return (
    <div style={{ width: '100%', marginTop: '6px' }}>
      <div style={{
        height: '4px', borderRadius: '4px',
        background: 'rgba(255,255,255,0.07)',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color,
          borderRadius: '4px',
          transition: 'width 0.8s ease',
          boxShadow: `0 0 6px ${color}88`
        }} />
      </div>
    </div>
  );
}

// ─── Live Power Consumption Panel ─────────────────────────────────────────
function PowerConsumptionPanel({ isSensorOn }) {
  const [componentStates, setComponentStates] = useState(() =>
    Object.fromEntries(COMPONENTS.map((c) => [c.id, c.id === 'router']))
  );
  const [watts, setWatts] = useState(() =>
    Object.fromEntries(COMPONENTS.map((c) => [c.id, 0]))
  );
  const [totalKwh, setTotalKwh] = useState(0);
  const totalKwhRef = useRef(0);

  // Update watt readings every 1.5s for live effect
  useEffect(() => {
    const interval = setInterval(() => {
      const newWatts = {};
      let totalW = 0;
      COMPONENTS.forEach((c) => {
        const active = componentStates[c.id] && isSensorOn;
        const w = parseFloat(simulateWatts(c.baseWatts, active));
        newWatts[c.id] = w;
        totalW += w;
      });
      setWatts(newWatts);
      // Accumulate kWh (watts * 1.5s tick = watt-seconds / 3600000 = kWh)
      totalKwhRef.current += (totalW * 1.5) / 3600000;
      setTotalKwh(totalKwhRef.current);
    }, 1500);
    return () => clearInterval(interval);
  }, [componentStates, isSensorOn]);

  const toggleComponent = (id) => {
    setComponentStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalWatts = Object.values(watts).reduce((s, v) => s + v, 0);
  const estimatedCostPerHour = ((totalWatts / 1000) * 8).toFixed(3); // ₹8/unit

  return (
    <div className="glass-panel" style={{ marginBottom: '24px' }}>
      <div className="card-header-flex" style={{ marginBottom: '16px' }}>
        <h3 className="card-heading">
          <Zap size={20} color="#f59e0b" />
          Live Power Consumption Monitor
        </h3>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px'
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700,
            color: isSensorOn ? '#f59e0b' : 'var(--text-dim)'
          }}>
            {totalWatts.toFixed(1)} W
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Total Active Load
          </span>
        </div>
      </div>

      {/* Summary metrics row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
        marginBottom: '20px'
      }}>
        {[
          { label: 'Voltage', value: isSensorOn ? '230 V AC' : '0 V', color: '#06b6d4' },
          { label: 'Frequency', value: isSensorOn ? '50.01 Hz' : '--', color: '#a855f7' },
          { label: 'Est. Cost/hr', value: isSensorOn ? `₹${estimatedCostPerHour}` : '₹0.000', color: '#10b981' },
        ].map((m) => (
          <div key={m.label} style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
            border: '1px solid var(--border-color)', padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: m.color }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Component grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {COMPONENTS.map((comp) => {
          const Icon = comp.icon;
          const isActive = componentStates[comp.id] && isSensorOn;
          const w = watts[comp.id] || 0;
          return (
            <div
              key={comp.id}
              onClick={() => toggleComponent(comp.id)}
              style={{
                background: isActive
                  ? `rgba(${hexToRgb(comp.onColor)}, 0.08)`
                  : 'rgba(0,0,0,0.25)',
                border: `1px solid ${isActive ? comp.onColor + '55' : 'var(--border-color)'}`,
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* glow bg */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: '-20px', right: '-20px',
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: comp.onColor + '22', filter: 'blur(20px)'
                }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={18} color={isActive ? comp.onColor : 'var(--text-dim)'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isActive ? '#f8fafc' : 'var(--text-muted)' }}>
                    {comp.label}
                  </span>
                </div>
                {/* toggle pill */}
                <div style={{
                  width: '32px', height: '18px', borderRadius: '9px',
                  background: isActive ? comp.onColor : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background 0.3s'
                }}>
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: isActive ? '16px' : '3px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.3s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                  }} />
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: isActive ? comp.onColor : 'var(--text-dim)' }}>
                {isActive ? `${w} W` : `${(w).toFixed(1)} W`}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                {isActive ? 'Active' : componentStates[comp.id] ? 'Sensor OFF' : 'Disabled'}
              </div>
              <PowerGauge watts={w} maxWatts={comp.baseWatts * 1.1} color={comp.onColor} />
            </div>
          );
        })}
      </div>

      {/* kWh meter */}
      <div style={{
        marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
        border: '1px solid var(--border-color)', padding: '12px 18px'
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Session Energy Consumed (kWh)
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b' }}>
          {totalKwh.toFixed(6)} kWh
        </span>
      </div>

      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '10px', textAlign: 'center' }}>
        Click any component card to toggle it • Values update every 1.5s • Cost estimated at ₹8/kWh
      </p>
    </div>
  );
}

// Helper — convert hex color to "r, g, b" string
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255,255,255';
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function Dashboard({ sensorStatus, setSensorStatus, addToast }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');

  const [liveDuration, setLiveDuration] = useState(0);
  const isSensorOn = sensorStatus?.currentState === 'ON';

  const fetchStatusAndLogs = async () => {
    try {
      const [statusRes, logsRes] = await Promise.all([
        api.get('/sensor/status'),
        api.get('/sensor/history?limit=50'),
      ]);
      if (statusRes.data?.success) {
        setSensorStatus(statusRes.data.data);
        setLiveDuration(statusRes.data.data.currentDurationSeconds || 0);
      }
      if (logsRes.data?.success) {
        setLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    }
  };

  useEffect(() => {
    fetchStatusAndLogs();
    const interval = setInterval(fetchStatusAndLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setLiveDuration((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [sensorStatus?.currentState]);

  const formatTimer = (s = 0) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const formatDateTime = (iso) => {
    if (!iso) return '--';
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  };

  const handleToggle = async () => {
    const nextAction = isSensorOn ? 'OFF' : 'ON';
    setLoadingToggle(true);
    try {
      const res = await api.post('/sensor/toggle', {
        action: nextAction,
        sensorId: 'SENSOR_ALPHA_01',
      });
      if (res.data?.success) {
        const newLog = res.data.data;
        addToast(
          nextAction === 'ON' ? 'success' : 'info',
          `Sensor switched ${nextAction} at ${new Date(newLog.recordedAt).toLocaleTimeString()}`
        );
        fetchStatusAndLogs();
      }
    } catch (err) {
      addToast('error', err.response?.data?.message || 'Toggle request failed');
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all sensor switch history logs?')) return;
    try {
      const res = await api.delete('/sensor/history');
      if (res.data?.success) {
        addToast('info', 'Sensor switch history cleared.');
        fetchStatusAndLogs();
      }
    } catch {
      addToast('error', 'Could not clear history');
    }
  };

  const handleExportCSV = () => {
    if (!logs.length) { addToast('error', 'No history logs to export.'); return; }
    const headers = ['ID,SensorID,State,RecordedAt,DurationSeconds,TriggeredBy,Temperature,Vibration,Battery,StatusMessage'];
    const rows = logs.map((l) =>
      `"${l.id}","${l.sensorId}","${l.state}","${l.recordedAt}","${l.durationSeconds || 0}","${l.triggeredBy}","${l.temperature}","${l.vibration}","${l.batteryLevel}","${l.statusMessage || ''}"`
    );
    const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `sensor_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Sensor logs exported to CSV!');
  };

  const filteredLogs = logs.filter((log) => {
    const matchesState = stateFilter === 'ALL' || log.state === stateFilter;
    const matchesQuery =
      searchQuery === '' ||
      log.triggeredBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recordedAt?.includes(searchQuery) ||
      log.state?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesQuery;
  });

  return (
    <div className="dashboard-grid">
      {/* LEFT COLUMN */}
      <div className="glass-panel sensor-hero-panel">
        <span className="sensor-badge">
          <Radio size={13} className="spin" />
          Node SENSOR_ALPHA_01
        </span>
        <h2 className="sensor-title">IoT Detection Simulation</h2>
        <p className="sensor-subtitle">
          Toggle the switch below to simulate physical sensor state.
        </p>

        {/* Master Toggle */}
        <div className="switch-wrapper">
          <button
            id="sensor-master-toggle"
            className={`master-toggle-btn ${isSensorOn ? 'state-on' : 'state-off'}`}
            onClick={handleToggle}
            disabled={loadingToggle}
            title={`Click to turn sensor ${isSensorOn ? 'OFF' : 'ON'}`}
          >
            <div className="toggle-icon-wrap">
              <Power size={54} color={isSensorOn ? '#34d399' : '#94a3b8'} strokeWidth={2.5} />
            </div>
            <span className="toggle-state-text" style={{ color: isSensorOn ? '#34d399' : '#94a3b8' }}>
              {loadingToggle ? 'SAVING...' : isSensorOn ? 'POWER ON' : 'STANDBY'}
            </span>
          </button>
          <span className="toggle-hint">
            {isSensorOn ? '● Sensor is actively emitting telemetry' : '○ Sensor is idle in low power mode'}
          </span>
        </div>

        {/* Live Duration */}
        <div style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)',
          borderRadius: '12px', padding: '14px 20px', width: '100%',
          marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {isSensorOn ? 'Active Run Duration' : 'Standby Duration'}
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700,
            color: isSensorOn ? '#34d399' : '#f8fafc'
          }}>
            {formatTimer(liveDuration)}
          </span>
        </div>

        {/* Telemetry Gauges */}
        <div className="switch-telemetry-row">
          <div className="telemetry-mini-card">
            <div className="mini-icon" style={{ color: '#f59e0b' }}><Thermometer size={18} /></div>
            <div>
              <div className="mini-value">{isSensorOn ? (sensorStatus?.lastTemperature || 44.2).toFixed(1) : '24.1'}°C</div>
              <div className="mini-label">Core Temp</div>
            </div>
          </div>
          <div className="telemetry-mini-card">
            <div className="mini-icon" style={{ color: '#06b6d4' }}><Activity size={18} /></div>
            <div>
              <div className="mini-value">{isSensorOn ? (sensorStatus?.lastVibration || 2.4).toFixed(2) : '0.02'} g</div>
              <div className="mini-label">Vibration</div>
            </div>
          </div>
          <div className="telemetry-mini-card">
            <div className="mini-icon" style={{ color: '#10b981' }}><BatteryCharging size={18} /></div>
            <div>
              <div className="mini-value">{sensorStatus?.lastBatteryLevel || 94}%</div>
              <div className="mini-label">Battery Level</div>
            </div>
          </div>
          <div className="telemetry-mini-card">
            <div className="mini-icon" style={{ color: '#a855f7' }}><Zap size={18} /></div>
            <div>
              <div className="mini-value">{isSensorOn ? 'ACTIVE' : 'IDLE'}</div>
              <div className="mini-label">Status Mode</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="dashboard-main">
        {/* Stats Grid */}
        <div className="stats-cards-grid">
          <div className="glass-panel stat-card">
            <div className="stat-info">
              <span className="stat-label">Current State</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className={`state-pill ${isSensorOn ? 'on' : 'off'}`}>
                  {isSensorOn ? 'ONLINE (ON)' : 'OFFLINE (OFF)'}
                </span>
              </div>
              <span className="stat-sub">Operator: {sensorStatus?.lastTriggeredBy || user?.fullName || 'USER'}</span>
            </div>
            <div className="stat-icon-wrap" style={{ color: isSensorOn ? '#10b981' : '#ef4444' }}>
              <Power size={24} />
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Switch Events</span>
              <span className="stat-number">{sensorStatus?.totalSwitches || 0}</span>
              <span className="stat-sub">
                ON: {sensorStatus?.totalOnCount || 0} | OFF: {sensorStatus?.totalOffCount || 0}
              </span>
            </div>
            <div className="stat-icon-wrap"><Zap size={24} /></div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-info">
              <span className="stat-label">Cumulative Uptime</span>
              <span className="stat-number">{sensorStatus?.uptimeFormatted || '00h 00m 00s'}</span>
              <span className="stat-sub">Total active operational duration</span>
            </div>
            <div className="stat-icon-wrap"><Clock size={24} /></div>
          </div>
        </div>

        {/* ─── Live Power Consumption Panel ── */}
        <PowerConsumptionPanel isSensorOn={isSensorOn} />

        {/* Oscilloscope */}
        <div className="glass-panel visualizer-card">
          <div className="card-header-flex">
            <h3 className="card-heading">
              <Activity size={20} color="var(--accent-cyan)" />
              Live Sensor Signal &amp; Telemetry Waveform
            </h3>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              color: isSensorOn ? '#34d399' : 'var(--text-dim)',
              background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px'
            }}>
              {isSensorOn ? 'FREQ: 2.45 GHz | EMITTING' : 'CARRIER STANDBY'}
            </span>
          </div>
          <SensorOscilloscope isSensorOn={isSensorOn} vibration={sensorStatus?.lastVibration || 1} />
        </div>

        {/* History Table */}
        <div className="glass-panel history-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-heading">
                <Clock size={20} color="var(--accent-cyan)" />
                Recorded Switch Timestamps &amp; History
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Every ON and OFF transition is timestamped and persisted in the backend database
              </p>
            </div>
            <div className="card-tools">
              <button className="nav-btn" onClick={fetchStatusAndLogs} title="Refresh logs">
                <RefreshCw size={14} /><span>Refresh</span>
              </button>
              <button className="nav-btn" onClick={handleExportCSV} title="Export CSV">
                <Download size={14} /><span>Export CSV</span>
              </button>
              {user && (
                <button className="nav-btn" onClick={handleClearHistory} style={{ color: '#f87171' }}>
                  <Trash2 size={14} /><span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter */}
          <div style={{
            display: 'flex', gap: '12px', marginBottom: '16px',
            flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search by operator, time, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 36px',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'ON', 'OFF'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStateFilter(f)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem',
                    fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border-color)',
                    background: stateFilter === f ? 'rgba(6,182,212,0.2)' : 'rgba(0,0,0,0.2)',
                    color: stateFilter === f ? 'var(--accent-cyan)' : 'var(--text-muted)'
                  }}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Recorded Timestamp</th>
                  <th>State</th>
                  <th>Session Duration</th>
                  <th>Trigger Operator</th>
                  <th>Core Temp</th>
                  <th>Vibration</th>
                  <th>Battery</th>
                  <th>Status Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                      No switch events found. Click the ON/OFF button to record your first event!
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>#{log.id}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatDateTime(log.recordedAt)}</td>
                      <td>
                        <span className={`state-pill ${log.state === 'ON' ? 'on' : 'off'}`}>{log.state}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {log.durationSeconds != null ? `${log.durationSeconds}s` : '--'}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{log.triggeredBy || 'USER'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{log.temperature ? `${log.temperature}°C` : '--'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{log.vibration ? `${log.vibration}g` : '--'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{log.batteryLevel != null ? `${log.batteryLevel}%` : '--'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.statusMessage}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
