import React, { useEffect } from 'react';
import './footer.style.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGithub, faInstagram, faLinkedinIn, faXTwitter } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    // Social media links with fallbacks
    const socialLinks = {
        facebook: process.env.REACT_APP_FACEBOOK || 'https://facebook.com',
        twitter: process.env.REACT_APP_TWITTER || 'https://twitter.com',
        instagram: process.env.REACT_APP_INSTAGRAM || 'https://instagram.com',
        github: process.env.REACT_APP_GITHUB || 'https://github.com',
        linkedin: process.env.REACT_APP_LINKEDIN || 'https://linkedin.com'
    };

    const creatorName = process.env.REACT_APP_CREATOR_NAME || 'React News App';

    return (
        <div className='footer'>
            <div className="social-links-container">
                <a href={socialLinks.facebook} className="social-link fa-facebook" target='_blank' rel='noreferrer'>
                    <FontAwesomeIcon className='fa-social' icon={faFacebookF} />
                </a>

                <a href={socialLinks.twitter} className="social-link fa-twitter" target='_blank' rel='noreferrer'>
                    <FontAwesomeIcon className='fa-social' icon={faXTwitter} />
                </a>

                <a href={socialLinks.instagram} className="social-link fa-instagram" target='_blank' rel='noreferrer'>
                    <FontAwesomeIcon className='fa-social' icon={faInstagram} />
                </a>

                <a href={socialLinks.github} className="social-link fa-github" target='_blank' rel='noreferrer'>
                    <FontAwesomeIcon className='fa-social' icon={faGithub} />
                </a>

                <a href={socialLinks.linkedin} className="social-link fa-linkedin" target='_blank' rel='noreferrer'>
                    <FontAwesomeIcon className='fa-social' icon={faLinkedinIn} />
                </a>
            </div>

            <p className="footer-credits">
                ©{creatorName} {new Date().getFullYear()}
            </p>
        </div>
    );
}

export default Footer;
