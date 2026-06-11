import React from 'react';
import ClientList from './ClientList';

const Sidebar = ({ clients, selectedClient, onSelectClient, searchQuery, onSearchChange, onAddClient, onShowDashboard }) => {
  return (
    <aside className="w-[280px] flex-shrink-0 border-r border-[#2a2a2a] bg-[#161616] flex flex-col">
      {/* Sidebar Header */}
      <div className="px-5 py-5 border-b border-[#2a2a2a] flex items-center justify-between">
        <button
          onClick={onShowDashboard}
          className="font-['DM_Mono'] text-[11px] text-[#555] tracking-[0.1em] uppercase hover:text-[#888] transition-colors"
        >
          Clients
        </button>
        <span className="font-['DM_Mono'] text-[11px] text-[#c8f135] bg-[rgba(200,241,53,0.08)] px-2 py-0.5 rounded-full">
          {clients.length}
        </span>
      </div>

      {/* Search */}
      <div className="px-4 py-4 border-b border-[#2a2a2a]">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#1f1f1f] border border-[#2a2a2a] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2 rounded-[4px] outline-none focus:border-[#383838] placeholder-[#555]"
        />
      </div>

      {/* Client List */}
      <ClientList
        clients={clients}
        selectedClient={selectedClient}
        onSelectClient={onSelectClient}
      />

      {/* Add Client Button */}
      <button
        onClick={onAddClient}
        className="mx-5 my-4 bg-[#c8f135] text-[#0e0e0e] border-none font-['Bebas_Neue'] text-[18px] tracking-[0.04em] px-4 py-2.5 rounded-[4px] cursor-pointer hover:opacity-88 transition-opacity text-center"
      >
        + NEW CLIENT
      </button>
    </aside>
  );
};

export default Sidebar;
