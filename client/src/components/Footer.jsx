import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 mt-auto border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">StadiumManager</h3>
                        <p className="text-sm text-gray-400">
                            Your premier destination for booking stadium tickets. Secure, fast, and reliable.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="hover:text-secondary transition">Home</a></li>
                            <li><a href="/stadiums" className="hover:text-secondary transition">Stadiums</a></li>
                            <li><a href="/my-bookings" className="hover:text-secondary transition">My Bookings</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-secondary transition">FAQ</a></li>
                            <li><a href="#" className="hover:text-secondary transition">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-secondary transition">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-secondary transition">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Contact Info</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Email:cbdisamadfast@gmail.com</li>
                            <li>Phone:252612527767</li>
                            <li>Address: Somali,Mogadisho</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Online Stadium Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
