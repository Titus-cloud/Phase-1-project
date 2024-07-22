document.addEventListener('DOMContentLoaded', () => {
  const menuItemsElement = document.getElementById('menu-items');
  const cartItemsElement = document.getElementById('cart-items');
  const totalPriceElement = document.getElementById('total-price');
  const orderForm = document.getElementById('order-form');
  const createItemButton = document.getElementById('create-item');
  const saveNewItemButton = document.getElementById('save-new-item');
  const cancelNewItemButton = document.getElementById('cancel-new-item');
  const newItemNameInput = document.getElementById('new-item-name');
  const newItemPriceInput = document.getElementById('new-item-price');
  let cart = [];

  // Fetch menu items from the server and display them initially
  async function fetchMenuItemsAndDisplay() {
    try {
      const response = await fetch('http://localhost:4000/menuItems');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const menuItems = await response.json();
      renderMenuItems(menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  }

  // Render menu items on the page
  function renderMenuItems(menuItems) {
    menuItemsElement.innerHTML = ''; // Clear existing menu items
    menuItems.forEach((item) => {
      const menuItemElement = document.createElement('li');
      menuItemElement.textContent = `${item.name} - Ksh ${item.price.toFixed(2)}`;

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to delete ${item.name}?`);
        if (confirmed) {
          try {
            const response = await fetch(`http://localhost:4000/menuItems/${item.id}`, {
              method: 'DELETE',
            });
            if (!response.ok) {
              throw new Error('Failed to delete item');
            }
            await fetchMenuItemsAndDisplay(); // Update menu items after successful deletion
          } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again.');
          }
        }
      });

      menuItemElement.appendChild(deleteButton);
      menuItemsElement.appendChild(menuItemElement);
    });
  }

  // Initial fetch of menu items when the page loads
  fetchMenuItemsAndDisplay();

  // Handle form submission to add item to the cart
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form submission

    const orderItemName = document.getElementById('order-item').value.trim();
    const orderItemPrice = parseFloat(document.getElementById('order-price').value.trim());

    if (orderItemName && !isNaN(orderItemPrice) && orderItemPrice > 0) {
      addItemToCart(orderItemName, orderItemPrice);
      document.getElementById('order-item').value = '';
      document.getElementById('order-price').value = '';
    } else {
      alert('Please enter a valid item name and price.');
    }
  });

  // Function to add item to cart
  function addItemToCart(itemName, itemPrice) {
    const newItem = {
      name: itemName,
      price: itemPrice,
      id: generateItemId(),
    };
    cart.push(newItem);
    updateCart();
  }

  // Update cart display
  function updateCart() {
    cartItemsElement.innerHTML = '';
    let totalPrice = 0;
    cart.forEach((item) => {
      const cartItemElement = document.createElement('li');
      cartItemElement.textContent = `${item.name} - Ksh ${item.price.toFixed(2)}`;
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        const itemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);
        if (itemIndex !== -1) {
          cart.splice(itemIndex, 1);
          updateCart();
        }
      });

      cartItemElement.appendChild(deleteButton);
      cartItemsElement.appendChild(cartItemElement);
      totalPrice += item.price;
    });
    totalPriceElement.textContent = `Ksh ${totalPrice.toFixed(2)}`;
  }

  // Handle create item button click to open modal
  createItemButton.addEventListener('click', () => {
    openNewItemPage();
  });

  // Function to open modal and handle new item creation
  function openNewItemPage() {
    const modalElement = document.getElementById('create-item-container');
    modalElement.style.display = 'block';

    saveNewItemButton.addEventListener('click', async () => {
      const newItemName = newItemNameInput.value.trim();
      const newItemPrice = parseFloat(newItemPriceInput.value.trim());

      if (newItemName && !isNaN(newItemPrice) && newItemPrice > 0) {
        const newItem = {
          name: newItemName,
          price: newItemPrice,
          id: generateItemId(),
        };

        try {
          const response = await fetch('http://localhost:4000/menuItems', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newItem),
          });

          if (!response.ok) {
            throw new Error('Failed to add new item');
          }

          console.log('New item added successfully.');
          await fetchMenuItemsAndDisplay(); // Update menu items after successful addition
          modalElement.style.display = 'none'; // Close modal after successful save
        } catch (error) {
          console.error('Error saving new item:', error);
          alert('Failed to add new item. Please try again.');
        }
      } else {
        alert('Please enter a valid item name and price.');
      }
    });

    cancelNewItemButton.addEventListener('click', () => {
      modalElement.style.display = 'none'; // Close modal if user cancels
    });
  }

  // Generate unique item ID (example implementation)
  function generateItemId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
});
