(() => {
  const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`);
  const currentUser = { id: localStorage.getItem('chatwave-user-id') || crypto.randomUUID(), name: localStorage.getItem('chatwave-user-name') || prompt('Choose your display name', 'You') || 'Guest' };
  localStorage.setItem('chatwave-user-id', currentUser.id); localStorage.setItem('chatwave-user-name', currentUser.name);
  const messages = document.getElementById('messages'); const input = document.getElementById('input'); const list = document.getElementById('list');
  let conversationId = 'direct';
  function send(data) { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data)); }
  function addMessage(message) { const mine = message.sender.id === currentUser.id; messages.insertAdjacentHTML('beforeend', `<div class="msg ${mine ? 'mine' : ''}"><div class="mini">${String(message.sender.name).slice(0,2).toUpperCase()}</div><div><div class="bubble">${String(message.text).replace(/</g,'&lt;')}</div><div class="meta">${new Date(message.sentAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} · ${mine ? '✓ Sent' : 'Received'}</div></div></div>`); messages.scrollTop = messages.scrollHeight; }
  socket.onopen = () => send({ type: 'hello', ...currentUser });
  socket.onmessage = event => { const data = JSON.parse(event.data); if (data.type === 'message' && data.message.conversationId === conversationId) addMessage(data.message); if (data.type === 'group-created') addGroup(data.group); };
  const form = document.getElementById('composer'); if (form) form.onsubmit = event => { event.preventDefault(); const text = input.value.trim(); if (!text) return; send({ type: 'message', conversationId, text }); input.value = ''; };
  function addGroup(group) { if ([...list.querySelectorAll('.chat')].some(item => item.dataset.group === group.id)) return; const button = document.createElement('button'); button.className = 'chat'; button.dataset.group = group.id; button.innerHTML = `<div class="face">${group.name.slice(0,2).toUpperCase()}</div><div class="chatcopy"><b>${group.name} <span class="verified">✓</span></b><div class="preview">New encrypted group</div></div>`; button.onclick = () => { conversationId = group.id; document.querySelectorAll('.chat').forEach(item => item.classList.remove('active')); button.classList.add('active'); }; list.prepend(button); }
  const fab = document.querySelector('.fab'); if (fab) fab.onclick = () => { const name = prompt('Name your new encrypted group'); if (name) send({ type: 'create-group', name }); };
})();
