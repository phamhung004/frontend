import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-5 gap-12 mb-12">
          {/* Contact Column */}
          <div className="space-y-8">
            <h3 className="text-[22px] font-bold uppercase text-gray-900 tracking-widest">{t('footer.contact')}</h3>
            <div className="space-y-2 text-lg text-gray-900">
              <p>{t('footer.workingHours')}</p>
              <div className="flex items-center space-x-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+01 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+01 567 890</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{t('footer.email')}</span>
              </div>
            </div>
          </div>

          {/* Company Column */}
          <div className="space-y-8">
            <h3 className="text-[22px] font-bold uppercase text-gray-900 tracking-widest">{t('footer.company')}</h3>
            <ul className="space-y-3 text-lg text-gray-900">
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.aboutUs')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.ourExperts')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.servicesPrice')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.latestNews')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.supportCenter')}</a></li>
            </ul>
          </div>

          {/* Customers Column */}
          <div className="space-y-8">
            <h3 className="text-[22px] font-bold uppercase text-gray-900 tracking-widest">{t('footer.customers')}</h3>
            <ul className="space-y-3 text-lg text-gray-900">
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.contactUs')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.paymentTax')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.bonusPoint')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.supplyChain')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.studentDiscount')}</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-8">
            <h3 className="text-[22px] font-bold uppercase text-gray-900 tracking-widest">{t('footer.support')}</h3>
            <ul className="space-y-3 text-lg text-gray-900">
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.shippingInfo')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.returns')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.refund')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.howToOrder')}</a></li>
              <li><a href="#" className="hover:text-[#9F86D9]">{t('footer.howToTrack')}</a></li>
            </ul>
          </div>

          {/* Social Column */}
          <div className="space-y-8">
            <h3 className="text-[22px] font-bold uppercase text-gray-900 tracking-widest">{t('footer.social')}</h3>
            <ul className="space-y-3 text-lg text-gray-900">
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                  <span>{t('footer.facebook')}</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  <span>{t('footer.twitter')}</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  <span>{t('footer.instagram')}</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0C4.477 0 0 4.477 0 10c0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zm3.5 13.75h-7a.75.75 0 010-1.5h7a.75.75 0 010 1.5zm0-3h-7a.75.75 0 010-1.5h7a.75.75 0 010 1.5zm0-3h-7a.75.75 0 010-1.5h7a.75.75 0 010 1.5z" />
                  </svg>
                  <span>Pinterest</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  <span>{t('footer.youtube')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-10">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#9F86D9] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-2xl font-bold text-[#9F86D9]" style={{ fontFamily: 'Codigra, sans-serif' }}>
                  Kidify
                </span>
              </a>
              <p className="text-sm text-gray-900">{t('footer.allRightsReserved')}</p>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs font-bold">MC</span>
              </div>
              <div className="w-12 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs font-bold">GP</span>
              </div>
              <div className="w-12 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs font-bold">PN</span>
              </div>
              <div className="w-12 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs font-bold">AP</span>
              </div>
              <div className="w-12 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs font-bold">PP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
