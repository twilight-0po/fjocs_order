async function fetchOrders() {
    const res = await fetch('/orders');
    const data = await res.json();
    const list = document.getElementById('order-list');
    list.innerHTML = '';
  
    if (!data) return;
  
    Object.entries(data).forEach(([id, order]) => {
      if (!order.items || order.items.length === 0) return;
      const hidden = order.items.every(item => item.status === 'cook_done' || item.status === 'done');
  if (hidden) return;
  
      const div = document.createElement('div');
      div.className = 'order';
  
      let acceptButton = '';
      if (order.status === 'received') {
        acceptButton = `<button class="accept-button" onclick="acceptOrder('${id}')">주문 수락</button>`;
      }
  
      const itemsHTML = order.items.map((item, idx) => {
        return `
          <button class="menu-item ${item.status}" onclick="advanceItemStatus('${id}', ${idx})">
            ${item.name}
          </button>
        `;
      }).join('');
  
      div.innerHTML = `
        <div class="order-title">🪑 테이블 ${order.table}</div>
        ${acceptButton}
        <div class="menu-list">${itemsHTML}</div>
      `;
  
      list.appendChild(div);
    });
  }
  
  async function acceptOrder(orderId) {
    const res = await fetch('/orders');
    const data = await res.json();
    const order = data[orderId];
  
    // 요리 상태를 전부 cooking으로 변경
    const updatedItems = order.items.map(item => ({
      name: item.name,
      status: "cooking"
    }));
  
    await fetch(`/orders/${orderId}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updatedItems })
    });
  
    await fetch(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: "cooking" })
    });
  
    fetchOrders();
  }

  
  function getNextStatus(current) {
    if (current === 'received') return 'cooking';
    if (current === 'cooking') return 'cook_done';
    return current;
  }
  
  async function advanceItemStatus(orderId, itemIndex) {
    const res = await fetch('/orders');
    const data = await res.json();
    const item = data[orderId].items[itemIndex];
    const next = getNextStatus(item.status);
  
    data[orderId].items[itemIndex].status = next;
  
    await fetch(`/orders/${orderId}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: data[orderId].items })
    });
  
    fetchOrders();
  }
  
  
  fetchOrders();
  setInterval(fetchOrders, 5000);
  