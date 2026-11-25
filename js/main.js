(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* 햄버거 메뉴 */
  var burger = $('.burger'), gnb = $('#gnb');
  function setMenu(open) {
    gnb.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }
  burger.addEventListener('click', function () { setMenu(!gnb.classList.contains('open')); });
  $$('a', gnb).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (innerWidth > 768) setMenu(false); });

  /* 스크롤 위치에 따른 메뉴 활성화 */
  var links = $$('.gnb a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var y = scrollY + 120, cur = -1;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* 스킬 바 애니메이션 */
  var bars = $$('.bar i');
  function fill(b) { b.style.width = b.dataset.w + '%'; }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); } });
    }, { threshold: .4 });
    bars.forEach(function (b) { io.observe(b); });
  } else bars.forEach(fill);

  /* 포트폴리오 탭 필터 */
  var tabs = $$('.tab'), works = $$('.work');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var f = t.dataset.filter;
      tabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
      works.forEach(function (w) { w.classList.toggle('hide', f !== 'all' && w.dataset.cat !== f); });
    });
  });

  /* 문의 팝업 */
  var modal = $('#modal'), form = $('#mailForm'), msg = $('#msg'), opener = $('#openMail');
  function openModal() { modal.hidden = false; document.body.style.overflow = 'hidden'; $('input', form).focus(); }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; opener.focus(); }
  opener.addEventListener('click', openModal);
  $('#closeMail').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  function say(t, ok) { msg.textContent = t; msg.className = 'msg' + (ok ? ' ok' : ''); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = {}; new FormData(form).forEach(function (v, k) { d[k] = v.trim(); });
    if (!d.name || !d.email || !d.message) return say('이름, 메일, 문의 내용을 입력해 주세요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return say('올바른 메일 주소를 입력해 주세요.');
    say('전송 중입니다...', true);
    d._subject = '[포트폴리오 문의] ' + d.name;
    fetch('https://formsubmit.co/ajax/addcoss@naver.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(d)
    }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function () { say('문의가 전송되었습니다. 감사합니다!', true); form.reset(); setTimeout(closeModal, 1800); })
      .catch(function () {
        /* 전송 실패 시 기본 메일 앱으로 대체 */
        var body = '이름: ' + d.name + '\n메일: ' + d.email + '\n전화번호: ' + d.phone + '\n\n' + d.message;
        location.href = 'mailto:addcoss@naver.com?subject=' + encodeURIComponent(d._subject) + '&body=' + encodeURIComponent(body);
        say('자동 전송이 어려워 메일 앱으로 연결합니다.');
      });
  });
})();
