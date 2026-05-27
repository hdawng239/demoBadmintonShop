import React, { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { MapPin, Phone } from 'lucide-react';

const StoreSystemPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const stores = [
        {
            name: "Naro Shop Cầu Giấy",
            address: "123 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội",
            phone: "0987654321"
        },
        {
            name: "Naro Shop Đống Đa",
            address: "456 Xã Đàn, Phường Nam Đồng, Quận Đống Đa, Hà Nội",
            phone: "0912345678"
        },
        {
            name: "Naro Shop Thanh Xuân",
            address: "789 Nguyễn Trãi, Phường Thanh Xuân Trung, Quận Thanh Xuân, Hà Nội",
            phone: "0966668888"
        }
    ];

    return (
        <MainLayout>
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h1 className="text-2xl font-bold text-gray-800 uppercase mb-6 flex items-center">
                        <MapPin className="mr-2 text-primary w-6 h-6" />
                        Hệ thống cửa hàng Naro Shop
                    </h1>
                    
                    <div className="flex flex-col lg:flex-row gap-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 h-[600px]">
                        
                        {/* Sidebar */}
                        <div className="w-full lg:w-1/3 flex flex-col h-full border-r border-gray-100">
                            <div className="p-4 space-y-3 bg-gray-50 rounded-t-lg">
                                <select className="w-full border border-gray-300 rounded-md p-2 text-gray-700 bg-white" disabled>
                                    <option>Hà Nội</option>
                                </select>
                                <select className="w-full border border-gray-300 rounded-md p-2 text-gray-700 bg-white" disabled>
                                    <option>Tất cả quận/huyện</option>
                                </select>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-2">
                                {stores.map((store, idx) => (
                                    <div key={idx} className="p-4 border-b border-gray-100 hover:bg-orange-50 transition-colors cursor-pointer rounded-lg mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2">{store.name}</h3>
                                        <div className="flex items-start text-gray-600 text-sm mb-1">
                                            <MapPin className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                                            <span>{store.address}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm font-medium">
                                            <Phone className="w-4 h-4 mr-2 text-primary shrink-0" />
                                            <span className="text-primary">{store.phone}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="w-full lg:w-2/3 h-full rounded-lg overflow-hidden bg-gray-200">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119066.52982230402!2d105.8041033!3d21.022736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2zSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1716790000000!5m2!1svi!2s" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StoreSystemPage;
