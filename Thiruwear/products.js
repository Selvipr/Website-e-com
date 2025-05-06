const products = [
    {
        id: 1,
        title: "Cotton Saree",
        price: 1200,
        category: "sarees",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
        description: "Elegant cotton saree perfect for daily wear."
    },
    {
        id: 2,
        title: "Silk Fabric",
        price: 1500,
        category: "fabrics",
        image: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=400&q=80",
        description: "Premium quality silk fabric for special occasions."
    },
    {
        id: 3,
        title: "Men's Shirt Fabric",
        price: 800,
        category: "mens",
        image: "https://images.unsplash.com/photo-1520975698516-3a1a7a7a7a7a?auto=format&fit=crop&w=400&q=80",
        description: "Soft and durable fabric for men's shirts."
    },
    {
        id: 4,
        title: "Kids' Dress Material",
        price: 600,
        category: "kids",
        image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
        description: "Colorful and comfortable fabric for kids."
    },
    {
        id: 5,
        title: "Linen Saree",
        price: 1400,
        category: "sarees",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80",
        description: "Lightweight linen saree for summer wear."
    },
    {
        id: 6,
        title: "Woolen Fabric",
        price: 1800,
        category: "fabrics",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
        description: "Warm woolen fabric for winter clothing."
    },
    {
        id: 7,
        title: "Men's Formal Shirt Fabric",
        price: 900,
        category: "mens",
        image: "https://images.unsplash.com/photo-1520975698516-3a1a7a7a7a7a?auto=format&fit=crop&w=400&q=80",
        description: "Premium fabric for men's formal shirts."
    },
    {
        id: 8,
        title: "Kids' Party Dress Material",
        price: 700,
        category: "kids",
        image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
        description: "Bright and colorful dress material for kids' parties."
    }
];

function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    container.innerHTML = '';
    products.slice(0, 4).forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3';

        col.innerHTML = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image" />
                <div class="product-title">${product.title}</div>
                <div class="product-price">₹${product.price}</div>
                <a href="product.html?id=${product.id}" class="btn btn-outline-primary btn-add-cart">View Details</a>
            </div>
        `;

        container.appendChild(col);
    });
}

function filterProductsByCategory(category) {
    if (!category) return products;
    return products.filter(p => p.category === category);
}

function searchProducts(query, productsList) {
    if (!query) return productsList;
    query = query.toLowerCase();
    return productsList.filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
}

function loadProductsByCategory(category) {
    const container = document.getElementById('product-list');
    if (!container) return; // safeguard if container not present
    container.innerHTML = '';
    const filteredProducts = filterProductsByCategory(category);
    if (filteredProducts.length === 0) {
        container.innerHTML = '<p>No products found in this category.</p>';
        return;
    }
    filteredProducts.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3';
        col.innerHTML = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image" />
                <div class="product-title">${product.title}</div>
                <div class="product-price">₹${product.price}</div>
                <p>${product.description}</p>
                <a href="product.html?id=${product.id}" class="btn btn-outline-primary btn-add-cart">View Details</a>
            </div>
        `;
        container.appendChild(col);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
        loadProductsByCategory(category);
    } else {
        loadFeaturedProducts();
    }
});
