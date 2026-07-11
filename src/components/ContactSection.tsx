import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';
import PillBadge from './ui/PillBadge';
import { trackFormEvent, trackClick, trackEvent, buildEventName } from '../utils/analytics';

type ActionsStage = 'hidden' | 'pre' | 'split' | 'done';

const ContactSection: React.FC = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ariaStatus, setAriaStatus] = useState<string>('');
  const [actionsStage, setActionsStage] = useState<ActionsStage>('hidden');
  const actionsRowRef = useRef<HTMLDivElement | null>(null);
  const sendBtnRef = useRef<HTMLButtonElement | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Residential',
    message: ''
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
  const contactContext = { page_section: 'contact_form', page_path: pagePath, origin: 'contact_contact_section' };

  const actionsShownRef = useRef(false);
  const successAnnouncedRef = useRef(false);

  const resetAnalyticsGuards = React.useCallback(() => {
    actionsShownRef.current = false;
    successAnnouncedRef.current = false;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    return () => {
      if (headingRef.current) observer.unobserve(headingRef.current);
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (actionsStage === 'done' && sendBtnRef.current) {
      sendBtnRef.current.focus();
    }
  }, [actionsStage]);

  useEffect(() => {
    if (isSuccess && !successAnnouncedRef.current) {
      successAnnouncedRef.current = true;
      trackEvent('contact_submit_visual_success', {
        ...contactContext,
        submission_method: 'netlify_forms_pending',
        service_type: formData.service,
        has_phone: !!formData.phone,
        has_email: !!formData.email,
        message_length: formData.message.length
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    const isRowVisible = actionsStage === 'split' || actionsStage === 'done';
    if (isRowVisible && !actionsShownRef.current) {
      actionsShownRef.current = true;
      trackEvent('contact_success_actions_shown', {
        ...contactContext,
        layout: '70_30',
        left_label: 'Send another Message',
        right_label: 'Call Now',
        service_type: formData.service
      });
    }
  }, [actionsStage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startSuccessPhase = () => {
    setIsSending(false);
    setIsSuccess(true);
    setAriaStatus("Message Sent. We'll be in touch shortly.");

    setTimeout(() => {
      setIsSuccess(false);
      setAriaStatus("Actions available: Send Message or Call Now.");

      setFormData({
        name: '',
        email: '',
        phone: '',
        service: 'Residential',
        message: ''
      });

      setActionsStage('pre');
      setTimeout(() => {
        setActionsStage('split');
        setTimeout(() => {
          setActionsStage('done');
        }, 350);
      }, 150);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startTime = performance.now();

    setActionsStage('hidden');

    console.log('[Contact] ENV', {
      ENABLE: import.meta.env.VITE_ENABLE_FORM_SEND,
      FAKE: import.meta.env.VITE_FAKE_SUCCESS_FLOW
    });

    trackFormEvent('form_submit', 'contact_form', {
      service_type: formData.service,
      has_phone: !!formData.phone,
      has_email: !!formData.email,
      message_length: formData.message.length
    });

    setIsSending(true);
    setIsSuccess(false);
    setAriaStatus('Sending message');

    const shouldSend = import.meta.env.VITE_ENABLE_FORM_SEND === 'true';

    const body = new URLSearchParams({
      'form-name': 'contact',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      message: formData.message
    });

    try {
      if (shouldSend) {
        console.log('[Contact] Will POST body', body.toString());

        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        });

        console.log('[Contact] Response', response.status, response.statusText);
        const responseText = await response.text();
        console.log('[Contact] Response body', responseText);

        if (!response.ok) {
          throw new Error(`Netlify submit failed: ${response.status} ${response.statusText} ${responseText}`.slice(0, 400));
        }

        trackEvent('contact_success_action', {
          form_name: 'contact',
          submission_method: 'netlify_post',
          page_path: window.location.pathname,
          page_title: document.title,
          has_phone: Boolean(formData.phone),
          has_email: Boolean(formData.email),
          intent_stage: 'conversion',
        });

        const elapsed = performance.now() - startTime;
        const remaining = Math.max(0, 4000 - elapsed);
        if (remaining > 0) {
          await new Promise(res => setTimeout(res, remaining));
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 4000));
      }

      startSuccessPhase();

      trackEvent('contact_form_submit_success', {
        ...contactContext,
        service_type: formData.service,
        submission_method: shouldSend ? 'netlify_forms' : 'visual_only_dev',
        has_phone: !!formData.phone,
        has_email: !!formData.email
      });

    } catch (err: any) {
      console.error('[Contact] POST failed', err);
      setIsSending(false);
      setIsSuccess(false);
      setAriaStatus('Submission failed. Please try again.');

      trackEvent('contact_form_submit_error', {
        ...contactContext,
        error_message: String(err?.message || err),
        service_type: formData.service,
        submission_method: shouldSend ? 'netlify_forms' : 'visual_only_dev'
      });
    }
  };

  const handleInputFocus = (fieldName: string) => {
    trackEvent('form_input_focus', {
      field_name: fieldName,
      form_name: 'contact_form'
    });
  };

  const handleServiceChange = (service: string) => {
    trackEvent('service_type_select', {
      selected_service: service,
      form_name: 'contact_form'
    });
    setFormData({ ...formData, service });
    setDropdownOpen(false);
  };

  return (
    <section id="contact" className="py-24 scroll-mt-[38px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <PillBadge variant="contact">Contact Us</PillBadge>
          <div className="bg-gradient-to-r from-[#7b1414] via-[#4e0e2f] via-[#2c0727] via-[#0f1f4c] via-[#1e3267] to-[#0a112e] bg-[length:300%_300%] animate-contactHeatWave transition-all duration-[3000ms] ease-in-out rounded-xl shadow-lg border border-white/10 px-6 py-4 max-w-4xl mx-auto flex flex-col items-center justify-center">
            <h2
              ref={headingRef}
              className={`text-3xl md:text-5xl font-bold mb-6`}
            >
              <span
                className={
                  hasAnimated
                    ? 'typewriter whitespace-nowrap relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00A8FF] via-[#00B7FF] to-[#00D1FF]'
                    : 'whitespace-nowrap relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00A8FF] via-[#00B7FF] to-[#00D1FF]'
                }
              >
                Get in Touch
              </span>
            </h2>
            <p className="text-lg text-white max-w-3xl mx-auto text-shadow-white animate-text-glow">
              Need emergency locksmith services or have questions about our services? Contact us 24/7.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
          <div>
            <div className="bg-gradient-to-br from-[#7b1414] via-[#4e0e2f] to-[#2c0727] bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl mb-8">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Phone</p>
                    <a
                      href="tel:+14023507534"
                      onClick={(e) => {
                        const eventName = buildEventName({ base: 'contact_section', action: 'call_button_click' });
                        trackClick(eventName, e.currentTarget, {
                          phone_number: '+14023507534',
                          source: 'contact_section',
                          page_section: 'contact',
                          origin: 'contact_section'
                        });
                      }}
                      className="text-white/70 hover:text-red-500 transition-colors"
                    >
                      (402) 350-7534
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Email</p>
                    <a 
                      href="mailto:Aksarbenlocks@gmail.com" 
                      onClick={(e) => trackClick('contact_email_click', e.currentTarget, { 
                        email: 'info@aksarbenlocksmiths.com',
                        source: 'contact_section',
                        page_section: 'contact'
                      })}
                      className="text-white/70 hover:text-red-500 transition-colors"
                    >
                      info@aksarbenlocksmiths.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Service Area</p>
                    <p className="text-white/70">
                      Omaha, Nebraska & All Surrounding Cities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Hours</p>
                    <p className="text-white/70">
                      24/7 Emergency Service
                    </p>
                    <p className="text-white/70">
                      Office: Mon-Fri 8am-6pm
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="map-container relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 h-64">
              <div className="pointer-events-none w-full h-64 bg-[url('/images/services-thumbnails/map-service-area.png')] bg-cover bg-[center_bottom_20%] rounded-2xl shadow-xl border border-white/20"></div>

              {/* Pill overlay, bottom center */}
              <Link
                to="/service-areas"
                aria-label="View Service Areas coverage"
                onClick={(e) => {
                  try { sessionStorage.setItem("lastScrollY", String(window.scrollY)); } catch {}
                  trackClick('service_areas_pill_click', e.currentTarget, {
                    source: 'map_card',
                    page_section: 'contact',
                    destination: '/service-areas'
                  });
                }}
                className="absolute left-1/2 bottom-4 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-700/90 text-white border border-red-800/30 transition-all duration-200 hover:scale-110 hover:shadow-[0_0_12px_4px_rgba(239,68,68,0.6)] hover:duration-100 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Service Areas</span>
              </Link>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#0f1f4c] via-[#1e3267] to-[#0a112e] bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
            <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
            
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
            >
              <input type="hidden" name="form-name" value="contact" />
              <input type="hidden" name="bot-field" />
              <input type="hidden" name="service" value={formData.service} />
              <div>
                <label htmlFor="name" className="block text-white/80 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('name')}
                  autoComplete="name"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Your name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleInputFocus('email')}
                    autoComplete="email"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-white/80 mb-2">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleInputFocus('phone')}
                    autoComplete="tel"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Your phone"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="service" className="block text-white/80 mb-2">Service Needed</label>
                <div className="relative w-full">
                  <button
                    type="button"
                    className="w-full bg-[#0d152b]/80 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-all duration-300 shadow-lg ring-1 ring-white/10 backdrop-blur-lg flex justify-between items-center"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {formData.service}
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-[#0d152b] border border-white/20 rounded-lg shadow-lg ring-1 ring-white/10 backdrop-blur-lg">
                      {['Residential', 'Commercial', 'Automotive', 'Safe Services', 'Other'].map(option => (
                        <div
                          key={option}
                          className={`p-3 text-white hover:bg-red-500 cursor-pointer transition`}
                          onClick={() => handleServiceChange(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-white/80 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('message')}
                  required
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Describe what you need..."
                ></textarea>
              </div>

              {actionsStage === 'hidden' ? (
                <button
                  type="submit"
                  aria-busy={isSending ? 'true' : undefined}
                  className={[
                    'relative w-full max-w-[720px] mx-auto overflow-hidden rounded-full font-medium transition-colors h-16',
                    'px-6',
                    isSuccess
                      ? 'bg-emerald-600 hover:bg-emerald-600 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
                      : (isSending
                          ? 'bg-neutral-700/90 hover:bg-neutral-700/90 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'),
                    ((isSending || isSuccess) ? 'cursor-not-allowed opacity-90' : '')
                  ].join(' ')}
                  disabled={isSending || isSuccess}
                >
                  <span aria-live="polite" className="sr-only">{ariaStatus}</span>

                  <span
                    className={[
                      'absolute left-0 top-0 h-full bg-neutral-300/35',
                      isSending ? 'animate-[send-progress-4s_4s_linear_forwards]' : 'w-0'
                    ].join(' ')}
                  />

                  {isSuccess && !isSending ? (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center leading-tight text-center"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <svg
                          className="w-5 h-5 rotate-12 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M2.94 12.66c-.66-.27-.66-1.05 0-1.32L19.3 4.47c.7-.28 1.39.41 1.11 1.11l-6.87 16.37c-.27.66-1.05.66-1.32 0l-2.52-6.01a1 1 0 0 0-.53-.53l-6.01-2.52Z"/>
                          <path d="M10.3 13.7 19.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className="text-[15px] sm:text-base font-semibold">Message Sent.</span>
                      </div>
                      <div className="text-[14px] sm:text-[15px] opacity-95 mt-0.5">
                        We'll be in touch shortly.
                      </div>
                    </div>
                  ) : (
                    <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-full">
                      {isSending && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      )}
                      <span>
                        {isSending ? 'Sending…' : 'Send Message'}
                      </span>
                    </span>
                  )}
                </button>
              ) : (
                <div
                  ref={actionsRowRef}
                  className={[
                    'relative w-full h-16 flex items-center gap-3',
                    (actionsStage === 'pre' || actionsStage === 'split') ? 'pointer-events-none' : 'pointer-events-auto'
                  ].join(' ')}
                >
                  <button
                    ref={sendBtnRef}
                    type="button"
                    className={[
                      'overflow-hidden rounded-full px-6 py-0 font-medium text-white transition-[width,background-color] ease-out',
                      'bg-red-600 hover:bg-red-700',
                      'whitespace-nowrap',
                      'text-sm md:text-base',
                      'h-full leading-none box-border',
                      'flex items-center justify-center gap-2',
                      actionsStage === 'pre'
                        ? 'w-full'
                        : (actionsStage === 'split' || actionsStage === 'done')
                          ? 'w-[calc(70%-0.375rem)]'
                          : 'w-full',
                      (actionsStage === 'split') ? 'duration-[350ms]' : '',
                      (actionsStage === 'pre') ? 'duration-[150ms]' : '',
                      (actionsStage === 'pre' || actionsStage === 'split') ? 'cursor-not-allowed opacity-90' : ''
                    ].join(' ')}
                    disabled={actionsStage === 'pre' || actionsStage === 'split'}
                    aria-label="Send another Message"
                    onClick={(e) => {
                      const eventName = buildEventName({ base: 'contact', action: 'send_another_click' });
                      trackClick(eventName, e.currentTarget, {
                        ...contactContext,
                        service_type: formData.service,
                        after_submit: true,
                        actions_stage: actionsStage
                      });
                      resetAnalyticsGuards();
                      setActionsStage('hidden');
                    }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    <span>Send another Message</span>
                  </button>

                  <a
                    href="tel:+14023507534"
                    className={[
                      'overflow-hidden rounded-full px-6 py-0 font-medium text-white bg-red-600 hover:bg-red-700',
                      'flex items-center justify-center gap-2',
                      'whitespace-nowrap',
                      'text-sm md:text-base',
                      'h-full leading-none box-border',
                      (actionsStage === 'pre')
                        ? 'opacity-0 translate-x-[100px]'
                        : (actionsStage === 'split' || actionsStage === 'done')
                          ? 'opacity-100 translate-x-0 transition-[transform,opacity] duration-[350ms] ease-out'
                          : 'opacity-0',
                      (actionsStage === 'split' || actionsStage === 'done') ? 'w-[calc(30%-0.375rem)]' : 'w-[calc(30%-0.375rem)]'
                    ].join(' ')}
                    aria-label="Call Now"
                    onClick={(e) => {
                      if (actionsStage === 'pre' || actionsStage === 'split') {
                        e.preventDefault();
                        return;
                      }
                      const eventName = buildEventName({ base: 'contact', action: 'call_after_submit_click' });
                      trackClick(eventName, e.currentTarget, {
                        ...contactContext,
                        phone_number: '+14023507534',
                        service_type: formData.service,
                        after_submit: true,
                        actions_stage: actionsStage
                      });
                    }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h2.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.24 1.01l-2.2 2.2z"/>
                    </svg>
                    <span>Call Now</span>
                  </a>

                  <span className="sr-only" aria-live="polite">
                    {actionsStage !== 'hidden' ? 'Actions available, Send another Message or Call Now.' : ''}
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;