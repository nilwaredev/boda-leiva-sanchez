function toggleHamburger(element) {
  const hamburger = element.querySelector('.hamburger-animated');
  hamburger.classList.toggle('open');

  const isHamburgerVisible = $('.navbar-toggler').is(':visible');
  const isScrolledLessThan50 = $(document).scrollTop() < 50;

  // Check if menu is now open (after toggle)
  const isMenuOpen = hamburger.classList.contains('open');

  if (isHamburgerVisible && isScrolledLessThan50 && isMenuOpen) {
      $('.mainNav').addClass('hamburgerclicked');
  } else {
      $('.mainNav').removeClass('hamburgerclicked');
  }
}

$(document).ready(function () {

  // 1. AOS Initialization
  AOS.init({
      duration: 1000,
      once: true,
  });

  // 2. Navbar Shrink on Scroll
  $(window).scroll(function () {
      if ($(document).scrollTop() > 50) {
          $('.mainNav').addClass('scrolled');
      } else {
          $('.mainNav').removeClass('scrolled');
      }
  });

  // 3. Smooth Scrolling for Nav Links
  $('.nav-link').on('click', function (event) {
      if (this.hash !== "") {
          // Prevent default anchor click behavior
          event.preventDefault();
          var hash = this.hash;
          $('html, body').animate({
              scrollTop: $(hash).offset().top - 70 // Adjust for fixed navbar height
          }, 800, function () {
              // window.location.hash = hash; // This line can be distracting
          });
      }
  });

  // 4. Countdown Timer
  // Set the date we're counting down to
  var countDownDate = new Date("Aug 08, 2026 17:00:00").getTime();

  // Update the count down every 1 second
  var x = setInterval(function () {
      var now = new Date().getTime();
      var distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the respective elements
      $('#days').html(days);
      $('#hours').html(hours);
      $('#minutes').html(minutes);
      $('#seconds').html(seconds);

      // If the count down is finished, write some text
      if (distance < 0) {
          clearInterval(x);
          $('#countdown').html("<h2>The Wedding Day is Here!</h2>");
      }
  }, 1000);

  // 5. Wedding Party Slider (Swiper JS)
  $(function () {
      $('.wedding-party-slider').each(function () {
          new Swiper(this, {
              loop: true,
              slidesPerView: 1,
              spaceBetween: 30,
              pagination: {
                  el: $(this).find('.swiper-pagination')[0],
                  clickable: true
              },
              breakpoints: {
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  768: { slidesPerView: 3, spaceBetween: 40 },
                  1024: { slidesPerView: 4, spaceBetween: 50 }
              }
          });
      });
  });

  // 6. Lightbox2 Initialization
  if (typeof lightbox !== "undefined") {
      lightbox.option({
          resizeDuration: 200,
          wrapAround: true,
          disableScrolling: true
      });
  }

  // 7. Decorative flowers reveal on scroll
  const decoSections = document.querySelectorAll('#countdown, #couple, #gallery, #registry');
  if (decoSections.length > 0) {
      if ('IntersectionObserver' in window) {
          const decoObserver = new IntersectionObserver(function (entries, observer) {
              entries.forEach(function (entry) {
                  if (entry.isIntersecting) {
                      entry.target.classList.add('deco-visible');
                      observer.unobserve(entry.target);
                  }
              });
          }, {
              threshold: 0.18,
              rootMargin: '0px 0px -8% 0px'
          });

          decoSections.forEach(function (section) {
              decoObserver.observe(section);
          });
      } else {
          decoSections.forEach(function (section) {
              section.classList.add('deco-visible');
          });
      }
  }

    // 8. Floating Music Player
  const player = document.getElementById('heroMusicPlayer');
  const panel = document.getElementById('musicPanel');
  const audio = document.getElementById('heroAudio');
  const toggleButton = document.getElementById('musicToggle');
  const toggleIcon = document.getElementById('musicToggleIcon');
  const progressContainer = document.getElementById('musicProgress');
  const progressFill = document.getElementById('musicProgressFill');
  const currentTimeEl = document.getElementById('musicCurrentTime');
  const durationEl = document.getElementById('musicDuration');
    let noteBurstInterval = null;

  function formatTime(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) {
          return '0:00';
      }
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function setPlayerVisualState(isPlaying) {
      if (toggleIcon) {
          toggleIcon.className = 'fas fa-music';
      }

      if (!toggleButton) return;
      toggleButton.classList.toggle('is-playing', isPlaying);

      if (isPlaying) {
          startNoteBurst();
      } else {
          stopNoteBurst();
      }
  }

  function emitFloatingNote() {
      if (!toggleButton || !audio || audio.paused) return;

      const note = document.createElement('span');
      const drift = (Math.random() * 44) - 22;
      const sizeJitter = 0.58 + (Math.random() * 0.34);
      note.className = 'music-note-particle';
      note.style.setProperty('--note-drift', `${drift.toFixed(0)}px`);
      note.style.fontSize = `${sizeJitter.toFixed(2)}rem`;
      note.innerHTML = '<i class="fas fa-music" aria-hidden="true"></i>';

      toggleButton.appendChild(note);
      window.setTimeout(function () {
          note.remove();
      }, 1150);
  }

  function startNoteBurst() {
      if (noteBurstInterval || !toggleButton) return;
      emitFloatingNote();
      noteBurstInterval = window.setInterval(emitFloatingNote, 320);
  }

  function stopNoteBurst() {
      if (noteBurstInterval) {
          window.clearInterval(noteBurstInterval);
          noteBurstInterval = null;
      }
  }

  function expandPlayer() {
      if (!player) return;
      player.classList.add('is-expanded');
      if (panel) {
          panel.setAttribute('aria-hidden', 'false');
      }
  }

  function collapsePlayer() {
      if (!player) return;
      player.classList.remove('is-expanded');
      if (panel) {
          panel.setAttribute('aria-hidden', 'true');
      }
  }

  function updateProgress() {
      if (!audio || !progressFill) return;
      if (!audio.duration) {
          progressFill.style.width = '0%';
          return;
      }
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = `${percent}%`;
  }

  function attemptAutoplay() {
      if (!audio) return;
      audio.play().then(() => {
          setPlayerVisualState(true);
      }).catch(() => {
          setPlayerVisualState(false);
      });
  }

  if (audio) {
      let suppressHoverUntilMouseLeave = false;
      const supportsHover = window.matchMedia('(hover: hover)').matches;

      audio.addEventListener('loadedmetadata', function () {
          if (durationEl) durationEl.textContent = formatTime(audio.duration);
      });

      audio.addEventListener('timeupdate', function () {
          if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
          updateProgress();
      });

      audio.addEventListener('play', function () {
          setPlayerVisualState(true);
      });

      audio.addEventListener('pause', function () {
          setPlayerVisualState(false);
      });

      audio.addEventListener('ended', function () {
          setPlayerVisualState(false);
      });

      if (toggleButton) {
          toggleButton.addEventListener('click', function (event) {
              event.stopPropagation();

              const isExpanded = player ? player.classList.contains('is-expanded') : false;
              if (!supportsHover && !isExpanded) {
                  expandPlayer();
                  return;
              }

              if (audio.paused) {
                  audio.play().catch(() => {});
              } else {
                  audio.pause();
              }

              if (supportsHover) {
                  suppressHoverUntilMouseLeave = true;
              }
              collapsePlayer();
          });
      }

      if (progressContainer) {
          progressContainer.addEventListener('click', function (event) {
              event.stopPropagation();
              const rect = progressContainer.getBoundingClientRect();
              const clickX = event.clientX - rect.left;
              const ratio = Math.min(Math.max(clickX / rect.width, 0), 1);
              if (audio.duration) {
                  audio.currentTime = ratio * audio.duration;
              }
          });
      }

      if (player) {
          player.addEventListener('click', function (event) {
              event.stopPropagation();
          });

          if (supportsHover) {
              player.addEventListener('mouseenter', function () {
                  if (!suppressHoverUntilMouseLeave) {
                      expandPlayer();
                  }
              });

              player.addEventListener('mouseleave', function () {
                  suppressHoverUntilMouseLeave = false;
                  collapsePlayer();
              });
          }
      }

      document.addEventListener('click', function () {
          collapsePlayer();
      });

      document.addEventListener('touchstart', function (event) {
          if (player && !player.contains(event.target)) {
              collapsePlayer();
          }
      }, { passive: true });

      setTimeout(attemptAutoplay, 2600);

      const unlockAutoplay = function () {
          if (audio.paused) {
              attemptAutoplay();
          }
      };

      document.addEventListener('click', unlockAutoplay, { once: true });
      document.addEventListener('touchstart', unlockAutoplay, { once: true });
      document.addEventListener('keydown', unlockAutoplay, { once: true });
  }
});

window.addEventListener('load', function () {
  const loader = document.getElementById('loader');
  const body = document.body;
  setTimeout(() => {
      loader.classList.add('loader-hidden');
      body.classList.remove('loading');

  }, 2500);
});