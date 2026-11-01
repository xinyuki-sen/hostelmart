          padding: 48px 52px 34px; display: flex; flex-direction: column;
          justify-content: space-between; position: relative; overflow: hidden;
          background: radial-gradient(circle at 15% 15%, rgba(53,214,160,.16), transparent 38%),
                      linear-gradient(145deg, #102d25 0%, #0b201b 55%, #0a1916 100%);
          border-right: 1px solid var(--line);
        }
        .brand-panel:after {
          content: ""; position: absolute; width: 390px; height: 390px; right: -190px;
          bottom: 70px; border: 1px solid rgba(93, 225, 179, .12); border-radius: 50%;
          box-shadow: 0 0 0 35px rgba(93,225,179,.025), 0 0 0 75px rgba(93,225,179,.02);
          pointer-events: none;
        }
        .brand { display: inline-flex; align-items: center; gap: 12px; width: fit-content; color: var(--ink); text-decoration: none; font-size: 21px; font-weight: 800; letter-spacing: -.7px; }
        .brand-mark, .mobile-brand .brand-mark {
          width: 42px; height: 42px; display: inline-grid; place-items: center;
          border-radius: 13px; color: #062118; font-size: 23px; font-weight: 900;
          background: linear-gradient(135deg, #62edba, #27bd8c); box-shadow: 0 8px 24px rgba(53,214,160,.2);
        }
        .brand-accent { color: var(--green); }
        .brand-copy { max-width: 455px; margin: 65px 0 55px; position: relative; z-index: 1; }
        .eyebrow, .secure-label, .form-kicker {
          display: inline-flex; align-items: center; gap: 9px; font-size: 10px;
          font-weight: 800; letter-spacing: 1.55px; color: #8fe6c5;
        }
        .live-dot, .secure-dot { width: 7px; height: 7px; display: inline-block; border-radius: 50%; background: var(--green); box-shadow: 0 0 12px rgba(53,214,160,.7); }
        .brand-copy h1 { max-width: 440px; margin: 22px 0 18px; font-size: clamp(38px, 4.1vw, 55px); line-height: 1.07; letter-spacing: -2.5px; font-weight: 800; }
        .brand-copy > p { max-width: 410px; margin: 0; color: #a6b9b3; font-size: 15px; line-height: 1.8; }
        .feature-list { display: grid; gap: 22px; margin-top: 48px; }
        .feature { display: flex; align-items: center; gap: 15px; }
        .feature-icon { width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center; border: 1px solid rgba(103,228,183,.2); border-radius: 12px; background: rgba(68,196,151,.08); color: #70e5b8; font-size: 19px; }
        .feature strong, .feature small { display: block; }
        .feature strong { color: #e4f0eb; font-size: 13px; font-weight: 700; }
        .feature small { margin-top: 4px; color: #8da69d; font-size: 11px; }
        .brand-footer { display: flex; justify-content: space-between; gap: 12px; color: #668078; font-size: 9px; letter-spacing: 1.25px; font-weight: 800; position: relative; z-index: 1; }
        .auth-panel { padding: 36px 54px 25px; display: flex; flex-direction: column; justify-content: space-between; background: linear-gradient(160deg, #10201c, #0b1714); }
        .mobile-brand { display: none; }
        .auth-topline { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .secure-label { color: #8fa69d; font-size: 9px; }
        .secure-dot { width: 6px; height: 6px; }
        .guest-link { color: #a9bbb4; font-size: 11px; text-decoration: none; transition: color .2s; }
        .guest-link:hover { color: var(--green); }
        .guest-link span { color: var(--green); margin-left: 4px; }
        .auth-content { width: 100%; max-width: 410px; margin: 35px auto; }
        .portal-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 5px; margin-bottom: 34px; border: 1px solid var(--line); border-radius: 13px; background: rgba(0,0,0,.17); }
        .portal-option { min-height: 43px; display: flex; justify-content: center; align-items: center; gap: 9px; border: 0; border-radius: 9px; background: transparent; color: #8ea39b; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .2s; }
        .portal-option.active { color: #08251b; background: linear-gradient(135deg, #68e9b8, #36c997); box-shadow: 0 5px 18px rgba(53,214,160,.14); }
        .portal-option.active.admin-active { color: #fff; background: linear-gradient(135deg, #e6a66c, #c87943); }
        .portal-icon { font-size: 16px; }
        .form-heading { margin-bottom: 27px; }
        .form-kicker { color: #69dcb0; font-size: 9px; }
        .admin-kicker { color: #e4ad7c; }
        .form-heading h2 { margin: 10px 0 8px; color: #eff7f3; font-size: 26px; line-height: 1.2; letter-spacing: -.9px; font-weight: 800; }
        .form-heading p { margin: 0; color: #91a59d; font-size: 12px; line-height: 1.65; }
        .field { margin-bottom: 18px; min-width: 0; }
        .field label { display: block; margin-bottom: 8px; color: #c9d8d1; font-size: 11px; font-weight: 700; }
        .input-wrap { min-height: 48px; display: flex; align-items: center; gap: 11px; padding: 0 14px; border: 1px solid rgba(177,205,194,.17); border-radius: 11px; background: rgba(4,13,10,.32); transition: border-color .2s, box-shadow .2s, background .2s; }
        .input-wrap:focus-within { border-color: rgba(76,218,165,.75); background: rgba(5,20,14,.6); box-shadow: 0 0 0 3px rgba(53,214,160,.09); }
        .input-icon { flex: 0 0 15px; color: #69cfa7; font-size: 16px; text-align: center; }
        .input-wrap input, .input-wrap select { width: 100%; min-width: 0; height: 46px; border: 0; outline: 0; background: transparent; color: #edf6f1; font: inherit; font-size: 12px; }
        .input-wrap input::placeholder { color: #61766d; }
        .input-wrap select { cursor: pointer; }
        .input-wrap select option { color: #102019; background: #eaf4ef; }
        .field-hint { display: block; margin-top: 6px; color: #71867d; font-size: 10px; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
        .field-grid .field { min-width: 0; }
        .submit-button { width: 100%; min-height: 49px; display: flex; justify-content: space-between; align-items: center; padding: 0 17px; margin-top: 8px; border: 0; border-radius: 11px; background: linear-gradient(110deg, #55e0aa, #2cbd8d); color: #06251a; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 9px 25px rgba(35,190,133,.16); transition: transform .2s, box-shadow .2s, filter .2s; }
        .submit-button:hover { transform: translateY(-2px); filter: brightness(1.06); box-shadow: 0 13px 30px rgba(35,190,133,.23); }
        .button-arrow { font-size: 20px; font-weight: 500; }
        .mode-toggle { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; margin-top: 22px; color: #879c93; font-size: 11px; }
        .mode-toggle button { padding: 0; border: 0; background: transparent; color: #69dfb2; font: inherit; font-weight: 800; cursor: pointer; }
        .mode-toggle button:hover { color: #a1f5d2; text-decoration: underline; }
        .message { display: flex; align-items: flex-start; gap: 9px; padding: 11px 13px; margin-bottom: 17px; border-radius: 9px; font-size: 11px; line-height: 1.5; }
        .error-message { border: 1px solid rgba(255,112,112,.25); background: rgba(170,48,48,.12); color: #ff9a9a; }
        .error-message span { display: grid; place-items: center; width: 17px; height: 17px; flex: 0 0 17px; border-radius: 50%; background: rgba(255,112,112,.16); font-weight: 900; }
        .success-message { border: 1px solid rgba(53,214,160,.25); background: rgba(53,214,160,.1); color: #8ce9c1; }
        .admin-notice { display: flex; align-items: center; gap: 12px; padding: 13px; margin: 0 0 23px; border: 1px solid rgba(222,160,105,.2); border-radius: 11px; background: rgba(192,119,63,.08); }
        .admin-shield { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: rgba(222,160,105,.13); color: #e7b184; }
        .admin-notice strong, .admin-notice small { display: block; }
        .admin-notice strong { color: #e9d8c9; font-size: 11px; }
        .admin-notice small { margin-top: 4px; color: #a99583; font-size: 10px; }
        .admin-submit { background: linear-gradient(110deg, #e7b17e, #c9824e); color: #2c170b; box-shadow: 0 9px 25px rgba(201,130,78,.13); }
        .admin-submit:hover { box-shadow: 0 13px 30px rgba(201,130,78,.2); }
        .admin-footnote { margin: 17px 0 0; color: #75877e; font-size: 10px; text-align: center; }
        .auth-footer { display: flex; justify-content: space-between; gap: 10px; color: #60746b; font-size: 9px; }
        @media (max-width: 850px) {
          .login-page { padding: 20px; }
          .login-shell { max-width: 540px; min-height: 0; grid-template-columns: 1fr; }
          .brand-panel { display: none; }
          .auth-panel { min-height: 680px; padding: 25px 34px 22px; }
          .mobile-brand { display: flex; align-items: center; gap: 10px; color: var(--ink); font-size: 19px; font-weight: 800; letter-spacing: -.5px; }
          .mobile-brand .brand-mark { width: 36px; height: 36px; font-size: 20px; }
          .auth-topline { margin-top: 28px; }
          .auth-content { margin: 30px auto; }
        }
        @media (max-width: 480px) {
          .login-page { padding: 0; align-items: stretch; }
          .login-shell { min-height: 100vh; border: 0; border-radius: 0; }
          .auth-panel { min-height: 100vh; padding: 22px 22px 18px; }
          .form-heading h2 { font-size: 23px; }
          .field-grid { grid-template-columns: 1fr; gap: 0; }
          .auth-footer { font-size: 8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </main>
  );
}
