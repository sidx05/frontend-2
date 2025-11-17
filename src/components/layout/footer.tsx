import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { SourcesTicker } from "./sources-ticker";
// Newsletter removed

const footerLinks = {
  News: [
    { name: "Breaking News", href: "/news" },
    { name: "Politics", href: "/categories/politics" },
    { name: "World", href: "/categories/world" },
    { name: "Sports", href: "/categories/sports" },
    { name: "Technology", href: "/categories/technology" },
    { name: "Health", href: "/categories/health" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Advertise", href: "/advertise" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Accessibility", href: "/accessibility" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
  Regions: [
    { name: "Hindi News", href: "/hindi" },
    { name: "Telugu News", href: "/telugu" },
    { name: "Tamil News", href: "/tamil" },
    { name: "Bengali News", href: "/bengali" },
    { name: "Marathi News", href: "/marathi" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/newshub" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/newshub" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/newshub" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/newshub" },
];

export function Footer() {
  return (
    <>
      <SourcesTicker />
      <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NewsHub
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Stay informed with the latest news from around the world. Breaking news, trending topics, and in-depth analysis across politics, technology, sports, and more.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>team.newshub@outlook.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 News Street, Media City, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Newsletter Section removed */}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 NewsHub. All rights reserved.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}