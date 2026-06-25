'use client'

import Link from 'next/link'
import { TrendingUp, Mail, Phone, MapPin, Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#FAFBFB] dark:bg-[#0A0A0B] text-[#6B7280] dark:text-[#9CA3AF] border-t border-[#E8E8E8] dark:border-[#2A2A2A] py-12 md:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-8 h-8 bg-[#44C2A4] rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A] dark:text-white text-lg">
                  Elite Capital
                </h3>
                <p className="text-[8px] text-[#6B7280] dark:text-[#9CA3AF] -mt-1 uppercase tracking-wider">
                  Smart Investing
                </p>
              </div>
            </Link>
            <p className="text-xs leading-relaxed">
              Elite Capital is a modern, direct investment platform offering real-time stock trading, mutual funds analysis, and commodities tracking for Indian retail investors.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#1A1A1A] dark:text-white text-sm uppercase tracking-wider">
              Products
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/stocks" className="hover:text-[#44C2A4] transition-colors">Stocks & Equities</Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-[#44C2A4] transition-colors">Mutual Funds</Link>
              </li>
              <li>
                <Link href="/commodities" className="hover:text-[#44C2A4] transition-colors">Commodities Trading</Link>
              </li>
              <li>
                <Link href="/indices" className="hover:text-[#44C2A4] transition-colors">Indices Trackers</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#1A1A1A] dark:text-white text-sm uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-[#44C2A4] transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#44C2A4] transition-colors">Investor Portfolio</Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-[#44C2A4] transition-colors">Account Settings</Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-[#44C2A4] transition-colors">My Watchlist</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#1A1A1A] dark:text-white text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#44C2A4] flex-shrink-0" />
                <span>Naman Centre, Bandra Kurla Complex, Mumbai, MH 400051</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#44C2A4] flex-shrink-0" />
                <span>+91 22 49302140</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#44C2A4] flex-shrink-0" />
                <span>support@elitecapital.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Disclaimer Section */}
        <div className="pt-8 border-t border-[#E8E8E8] dark:border-[#2A2A2A] text-[10px] leading-relaxed space-y-4">
          <p>
            <strong>Regulatory Disclosures:</strong> Elite Capital Markets Private Limited. SEBI Registration No: INZ000213425 (BSE & NSE member ID: 90214). Depository Participant Registration No: IN-DP-CDSL-654-2023. AMFI Registered Mutual Fund Distributor: ARN-193425.
          </p>
          <p>
            <strong>Disclaimer:</strong> Investment in the securities market are subject to market risks. Read all the related documents carefully before investing. Brokerage will not exceed the SEBI prescribed limit. Registration granted by SEBI, membership of a SEBI recognized stock exchange, and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 text-[11px] gap-2 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} Elite Capital. All rights reserved.</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-[#44C2A4] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#44C2A4] transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-[#44C2A4] transition-colors">SEBI SCORES</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
