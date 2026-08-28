import { Link } from 'react-router-dom';
import { Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white/80 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-heading-sm font-display text-white">
                Samvad<span className="text-accent-light">Setu</span>
              </span>
            </div>
            <p className="text-body-sm text-white/60 leading-relaxed">
              A digital bridge connecting citizens, students, universities, and industry 
              to collaboratively solve Jharkhand's societal challenges.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-body-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/feed" className="text-body-sm text-white/60 hover:text-white transition-colors">Discover Problems</Link></li>
              <li><Link to="/map" className="text-body-sm text-white/60 hover:text-white transition-colors">Problem Map</Link></li>
              <li><Link to="/match" className="text-body-sm text-white/60 hover:text-white transition-colors">Resource Matching</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-body-sm font-semibold text-white mb-4 uppercase tracking-wider">About</h4>
            <ul className="space-y-2.5">
              <li><span className="text-body-sm text-white/60">SIH Problem ID: SIH26043</span></li>
              <li><span className="text-body-sm text-white/60">Government of Jharkhand</span></li>
              <li><span className="text-body-sm text-white/60">Smart India Hackathon 2026</span></li>
            </ul>
          </div>

          {/* Contribute */}
          <div>
            <h4 className="text-body-sm font-semibold text-white mb-4 uppercase tracking-wider">Contribute</h4>
            <ul className="space-y-2.5">
              <li><Link to="/signup" className="text-body-sm text-white/60 hover:text-white transition-colors">Join as Citizen</Link></li>
              <li><Link to="/signup" className="text-body-sm text-white/60 hover:text-white transition-colors">Join as Student</Link></li>
              <li><Link to="/signup" className="text-body-sm text-white/60 hover:text-white transition-colors">Join as Industry</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-white/40">
            © 2026 SamvadSetu. Built for Smart India Hackathon.
          </p>
          <p className="text-caption text-white/40 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-danger inline fill-danger" /> for Jharkhand
          </p>
        </div>
      </div>
    </footer>
  );
}
