import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, ArrowRight, MessageSquare, ShieldCheck, Truck, RefreshCw, Send, Check } from 'lucide-react';

export default function AIEcommercePreview() {
  const products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: '$89',
      rawPrice: 89,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: '$149',
      rawPrice: 149,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 3,
      name: 'Gaming Mouse',
      price: '$59',
      rawPrice: 59,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  // Chatbot State
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi 👋 I can help you track deliveries and answer order-related questions.',
    },
    {
      sender: 'user',
      text: 'Where is my order #3245?',
    },
    {
      sender: 'bot',
      text: 'Your package is currently Out for Delivery 🚚 and should arrive today before 7 PM.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  
  // Shopping Cart State
  const [cart, setCart] = useState([]);
  const [activeTrackingId, setActiveTrackingId] = useState('#3245');
  const [trackingStatus, setTrackingStatus] = useState('Out for Delivery');
  const [trackingEta, setTrackingEta] = useState('Today, 7 PM');
  
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    // Notify chatbot
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: `🛒 Added "${product.name}" to your cart! Total is now $${[...cart, product].reduce((sum, item) => sum + item.rawPrice, 0)}.`
    }]);
  };

  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');

    setTimeout(() => {
      processBotReply(text.toLowerCase());
    }, 800);
  };

  const processBotReply = (query) => {
    let reply = '';
    
    if (query.includes('track') || query.includes('where') || query.includes('status') || query.includes('3245')) {
      reply = `📦 Order **${activeTrackingId}** Status: **${trackingStatus}**\n⏱️ ETA: **${trackingEta}**\n📍 Route: Main Hub -> Transit -> Out for Delivery.`;
    } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      reply = 'Hello! Welcome to AI Shop Support. You can ask me to track order #3245, modify cart items, or ask about product prices.';
    } else if (query.includes('price') || query.includes('headphones') || query.includes('watch') || query.includes('mouse')) {
      reply = 'Here are our pricing details:\n- Wireless Headphones: $89\n- Smart Watch: $149\n- Gaming Mouse: $59\nWould you like me to add one to your cart?';
    } else if (query.includes('buy') || query.includes('add') || query.includes('order')) {
      const found = products.find(p => query.includes(p.name.toLowerCase().split(' ')[1] || ''));
      if (found) {
        addToCart(found);
        return; // Already added message inside addToCart
      } else {
        reply = 'Which product would you like to add? (headphones, watch, or mouse)';
      }
    } else if (query.includes('cancel') || query.includes('refund')) {
      reply = 'To request a refund or cancel order #3245, please click on the "Track Shipment" button to access customer resolutions or type "Agent" to connect with our support desk.';
    } else {
      reply = "I'm your AI Shopping Assistant. I can track deliveries, check item prices, or help you with your shopping cart. Let me know what you need!";
    }

    setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center font-bold">🛒</div>
            <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">AI Shop</h1>
          </div>

          <nav className="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="#home" className="hover:text-white transition">Home</a>
            <a href="#products" className="hover:text-white transition">Products</a>
            <a href="#tracking" className="hover:text-white transition">Tracking</a>
            <a href="#chatbot" className="hover:text-white transition">AI Support</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Cart Badge */}
            <div className="relative p-2 bg-white/5 border border-white/10 rounded-full cursor-pointer hover:bg-white/10 transition">
              <ShoppingBag size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 text-black text-xs font-bold flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </div>
            
            <button className="bg-white text-black px-5 py-2 rounded-full font-medium hover:scale-105 transition-transform">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center px-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/20 via-black to-cyan-700/15" />

        <div className="relative z-10 text-center max-w-4xl">
          <div className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 text-sm text-gray-300">
            AI Powered E-Commerce Experience
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Smart Shopping <br />
            with <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI Delivery Support</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Full-stack e-commerce platform with intelligent chatbot,
            real-time delivery tracking, smooth animations, and modern UI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#products" className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform inline-block">
              Explore Products
            </a>

            <a href="#chatbot" className="px-8 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition inline-block">
              Live Chat Demo
            </a>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="products" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-14">
          <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-400 max-w-2xl">
            Browse interactive product cards with smooth hover animations and responsive design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="h-72 overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold">{product.name}</h3>
                  <span className="text-cyan-400 font-bold text-lg">{product.price}</span>
                </div>

                <button 
                  onClick={() => addToCart(product)}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Tracking */}
      <section
        id="tracking"
        className="py-24 px-6 bg-gradient-to-b from-black to-zinc-950"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Real-Time Delivery Tracking
            </h2>

            <p className="text-gray-400 mb-8 leading-relaxed">
              Customers can track every stage of delivery with dynamic status updates integrated directly into the chatbot and order dashboard.
            </p>

            <div className="space-y-6">
              {[
                'Order Confirmed',
                'Packed',
                'Shipped',
                'Out for Delivery',
                'Delivered',
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full ${index < 4 ? 'bg-green-400' : 'bg-white/20'}`} />
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400"
                      style={{ width: `${(index + 1) * 20}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Truck size={22} className="text-cyan-400" /> Order Summary
            </h3>

            <div className="space-y-4 text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Order ID</span>
                <span className="font-mono text-cyan-400">{activeTrackingId}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Status</span>
                <span className="text-green-400 font-semibold">{trackingStatus}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Arrival</span>
                <span>{trackingEta}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setTrackingStatus('Delivered');
                setTrackingEta('Arrived');
                setMessages(prev => [...prev, {
                  sender: 'bot',
                  text: '⚡ Update: Your order has been marked as DELIVERED by our delivery partner.'
                }]);
              }}
              className="mt-8 w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] transition-transform active:scale-95"
            >
              Simulate Delivery Success
            </button>
          </div>
        </div>
      </section>

      {/* AI Chatbot Preview */}
      <section id="chatbot" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">
            AI Delivery Assistant
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Intelligent chatbot designed to answer delivery queries instantly using real-time order information.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare size={16} className="text-cyan-400" /> BistroBot Support
              </h3>
              <p className="text-xs text-green-400">Online • Answers queries instantly</p>
            </div>

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          </div>

          <div className="p-6 space-y-4 bg-black/20 min-h-[350px] max-h-[400px] overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-cyan-400 text-black'
                      : 'bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendChat} className="p-4 border-t border-white/10 flex gap-3 bg-white/5">
            <input
              type="text"
              placeholder="Ask 'Where is my order #3245?' or item prices..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-500"
            />

            <button 
              type="submit"
              className="px-6 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-1"
            >
              Send <Send size={14} />
            </button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-gradient-to-r from-purple-700/20 to-cyan-700/20 border-t border-white/10">
        <h2 className="text-5xl font-bold mb-6">
          Build the Future of Smart Commerce
        </h2>

        <p className="text-gray-300 max-w-2xl mx-auto mb-10 text-lg">
          AI-driven shopping experiences, intelligent customer support, and scalable architecture in one modern application.
        </p>

        <button 
          onClick={() => {
            alert('Congratulations! You are running this React app locally. See the walkthrough file for Github instructions.');
          }}
          className="px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform active:scale-95"
        >
          Start Building
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 text-center text-gray-500 text-sm">
        © 2026 AI Shop — Full Stack MERN + AI Chatbot Preview
      </footer>
    </div>
  );
}
