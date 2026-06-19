"use client"
import React from 'react'
import { motion } from "motion/react"
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa'

function Footer() {
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Booking", href: "/booking" },
    { label: "About Us", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
  ]

  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "FAQs", href: "/faqs" },
    { label: "Become a Partner", href: "/partner" },
    { label: "Safety", href: "/safety" },
  ]

  return (
    <div className='w-full bg-black text-white'>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className='max-w-7xl mx-auto px-6 py-16'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12'>
          {/* Brand */}
          <div>
            <h2 className='text-2xl font-extrabold tracking-tight'>RYDEX</h2>
            <p className='text-sm text-gray-400 mt-3 leading-relaxed max-w-xs'>
              Book any vehicle — from bikes to trucks. Trusted owners. Transparent pricing.
            </p>

            <div className='flex items-center gap-3 mt-6'>
              <a href="#" aria-label="Facebook" className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition'>
                <FaFacebookF size={14} />
              </a>
              <a href="#" aria-label="Instagram" className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition'>
                <FaInstagram size={15} />
              </a>
              <a href="#" aria-label="Twitter" className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition'>
                <FaTwitter size={14} />
              </a>
              <a href="#" aria-label="LinkedIn" className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition'>
                <FaLinkedinIn size={14} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4'>
              Quick Links
            </h3>
            <ul className='flex flex-col gap-3'>
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className='text-sm text-gray-400 hover:text-white transition'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4'>
              Support
            </h3>
            <ul className='flex flex-col gap-3'>
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className='text-sm text-gray-400 hover:text-white transition'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4'>
              Contact
            </h3>
            <ul className='flex flex-col gap-4'>
              <li className='flex items-start gap-3 text-sm text-gray-400'>
                <MapPin size={16} className='mt-0.5 shrink-0' />
                <span>Gorakhpur, Uttar Pradesh, India</span>
              </li>
              <li className='flex items-center gap-3 text-sm text-gray-400'>
                <Phone size={16} className='shrink-0' />
                <a href="tel:+910000000000" className='hover:text-white transition'>+91 00000 00000</a>
              </li>
              <li className='flex items-center gap-3 text-sm text-gray-400'>
                <Mail size={16} className='shrink-0' />
                <a href="mailto:support@rydex.com" className='hover:text-white transition'>support@rydex.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500'>
          <p>© {new Date().getFullYear()} RYDEX. All rights reserved.</p>
          <div className='flex items-center gap-6'>
            <Link href="/privacy-policy" className='hover:text-white transition'>Privacy Policy</Link>
            <Link href="/terms" className='hover:text-white transition'>Terms of Service</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Footer