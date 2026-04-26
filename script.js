$(document).ready(function () {

  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (isTouchDevice) {
      document.documentElement.classList.add('touch-scroll-fix');
      document.querySelectorAll('[data-aos]').forEach(function (element) {
          // Keep only scroll-reveal transitions on touch devices.
          element.setAttribute('data-aos', 'fade-up');
          element.removeAttribute('data-aos-delay');
          element.setAttribute('data-aos-duration', '650');
          element.setAttribute('data-aos-easing', 'ease-out');
          element.removeAttribute('data-aos-anchor-placement');
      });
  }

  // 1. AOS Initialization
  if (typeof AOS !== 'undefined') {
      AOS.init({
          duration: isTouchDevice ? 650 : 1000,
          offset: isTouchDevice ? 40 : 90,
          once: true,
      });
  }

  // 2. Open external links in a new tab.
  $('a[href^="http://"], a[href^="https://"], a[href^="mailto:"], a[href^="tel:"]').attr({
      target: '_blank',
      rel: 'noopener noreferrer'
  });

  // 3. Countdown Timer
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

  // 4. Lightbox2 Initialization
  if (typeof lightbox !== "undefined") {
      lightbox.option({
          resizeDuration: 200,
          wrapAround: true,
          disableScrolling: !isTouchDevice
      });
  }

    // 5. Decorative flowers reveal on scroll
    const decoSections = document.querySelectorAll('#countdown, #event-details, #gallery, #registry');
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

    // 6. Floating Music Player
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

  function attemptAutoplay(allowMutedFallback = true) {
      if (!audio) return Promise.resolve(false);

      return audio.play().then(() => {
          setPlayerVisualState(true);
          return true;
      }).catch(() => {
          if (!allowMutedFallback) {
              setPlayerVisualState(false);
              return false;
          }

          const previousMutedState = audio.muted;
          audio.muted = true;

          return audio.play().then(() => {
              setPlayerVisualState(true);
              audio.muted = previousMutedState;
              return true;
          }).catch(() => {
              audio.muted = previousMutedState;
              setPlayerVisualState(false);
              return false;
          });
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

      document.addEventListener('touchmove', function () {
          const activeElement = document.activeElement;
          if (!activeElement) return;

          const tagName = activeElement.tagName;
          if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT') {
              activeElement.blur();
          }
      }, { passive: true });

      document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'hidden') {
              audio.pause();
          }
      });

      window.addEventListener('pagehide', function () {
          audio.pause();
      });

      window.addEventListener('beforeunload', function () {
          audio.pause();
      });

      attemptAutoplay();
      setTimeout(attemptAutoplay, 2600);

      const triggerAutoplayContingency = function () {
          if (audio.paused) {
              attemptAutoplay(false);
          }
      };

      window.addEventListener('loader:hidden', triggerAutoplayContingency, { once: true });
      window.addEventListener('scroll', triggerAutoplayContingency, { passive: true, once: true });
      window.addEventListener('wheel', triggerAutoplayContingency, { passive: true, once: true });
      window.addEventListener('touchmove', triggerAutoplayContingency, { passive: true, once: true });

      const unlockAutoplay = function () {
          if (audio.paused) {
              attemptAutoplay();
          }
      };

      document.addEventListener('click', unlockAutoplay, { once: true });
      document.addEventListener('touchstart', unlockAutoplay, { once: true });
      document.addEventListener('keydown', unlockAutoplay, { once: true });
  }

    // 7. RSVP dynamic personalization and submission
  const rsvpForm = document.getElementById('rsvpForm');
  const reservedNameEl = document.getElementById('rsvpReservedName');
    const reservedLabelEl = document.getElementById('rsvpReservedLabel');
  const reservedCountEl = document.getElementById('rsvpReservedCount');
    const rsvpFormTitleEl = document.getElementById('rsvpFormTitle');
    const guestNamesLabelEl = document.getElementById('rsvpGuestNamesLabel');
    const guestNamesInputEl = document.getElementById('rsvpGuestNames');
  const hiddenReservedFor = document.getElementById('rsvpHiddenReservedFor');
  const hiddenReservedCount = document.getElementById('rsvpHiddenReservedCount');
  const rsvpStatusEl = document.getElementById('rsvpFormStatus');
    const confirmationSelect = document.getElementById('rsvpConfirmation');

  function setRsvpStatus(message, variant) {
      if (!rsvpStatusEl) return;
      rsvpStatusEl.textContent = message;
      rsvpStatusEl.classList.remove('is-success', 'is-error');
      if (variant) {
          rsvpStatusEl.classList.add(variant);
      }
  }

  function parseSeatCount(rawValue) {
      if (!rawValue) return null;
      const match = String(rawValue).match(/\d+/);
      if (!match) return null;
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function buildConfirmationOptions(seatCount) {
      if (!confirmationSelect) return;

      const safeSeats = Number.isFinite(seatCount) && seatCount > 0 ? seatCount : 2;
      confirmationSelect.innerHTML = '';

      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = 'Confirmacion';
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      confirmationSelect.appendChild(placeholderOption);

      for (let seats = safeSeats; seats >= 1; seats -= 1) {
          const option = document.createElement('option');
          if (safeSeats === 1) {
              option.value = 'Asistiré';
          } else {
              option.value = seats === 1 ? 'Asistirá 1' : `Asistiremos ${seats}`;
          }
          option.textContent = option.value;
          confirmationSelect.appendChild(option);
      }

      const declineOption = document.createElement('option');
      const declineText = safeSeats === 1 ? 'No podré asistir' : 'No podremos asistir';
      declineOption.value = declineText;
      declineOption.textContent = declineText;
      confirmationSelect.appendChild(declineOption);
  }

  function applySeatAwareTexts(seatCount) {
      const singular = seatCount === 1;

      if (reservedLabelEl) {
          reservedLabelEl.textContent = singular ? 'Invitación reservada para' : 'Invitaciones reservadas para';
      }

      if (reservedCountEl) {
          reservedCountEl.textContent = `(${seatCount} ${singular ? 'persona' : 'personas'})`;
      }

      if (rsvpFormTitleEl) {
          rsvpFormTitleEl.textContent = singular ? 'Confirma tu Asistencia' : 'Confirmen su Asistencia';
      }

      if (guestNamesLabelEl) {
          guestNamesLabelEl.textContent = singular ? 'Nombre del asistente' : 'Nombres de los asistentes';
      }

      if (guestNamesInputEl) {
          guestNamesInputEl.placeholder = singular ? 'Nombre del asistente' : 'Nombres de los asistentes';
      }

      if (hiddenReservedCount) {
          hiddenReservedCount.value = `${seatCount} ${singular ? 'persona' : 'personas'}`;
      }
  }

  function applyReservedGuestData() {
      const params = new URLSearchParams(window.location.search);
      const reservedFor = params.get('invitados') || params.get('guest') || params.get('family');
      const reservedSeats = params.get('cupos') || params.get('seats') || params.get('personas');
      let resolvedSeats = null;

      if (reservedFor && reservedNameEl) {
          reservedNameEl.textContent = reservedFor;
      }

      if (reservedSeats && reservedCountEl) {
          const numberValue = Number(reservedSeats);
          resolvedSeats = Number.isFinite(numberValue) && numberValue > 0 ? numberValue : parseSeatCount(reservedSeats);
          const seatLabel = Number.isFinite(numberValue) && numberValue > 0 ? `${numberValue} personas` : reservedSeats;
          reservedCountEl.textContent = `(${seatLabel})`;
      }

      if (!resolvedSeats && hiddenReservedCount) {
          resolvedSeats = parseSeatCount(hiddenReservedCount.value);
      }

      if (!resolvedSeats && reservedCountEl) {
          resolvedSeats = parseSeatCount(reservedCountEl.textContent);
      }

      if (!resolvedSeats) {
          resolvedSeats = 2;
      }

      applySeatAwareTexts(resolvedSeats);

      if (hiddenReservedFor && reservedNameEl) {
          hiddenReservedFor.value = reservedNameEl.textContent.trim();
      }

      buildConfirmationOptions(resolvedSeats);
  }

  async function submitRsvpToEndpoint(formData) {
      const endpoint = (rsvpForm.dataset.endpoint || '').trim();
      const endpointUnset = endpoint === '' || endpoint.includes('YOUR_FORM_ID');
      if (endpointUnset) {
          return { ok: false, reason: 'endpoint-unset' };
      }

      const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
              'Accept': 'application/json'
          },
          body: formData
      });

      if (!response.ok) {
          return { ok: false, reason: 'request-failed' };
      }

      return { ok: true };
  }

  function sendRsvpByMailto(formData) {
      const recipient = (rsvpForm.dataset.recipientEmail || '').trim();
      if (!recipient) {
          return false;
      }

      const subject = encodeURIComponent('Confirmacion de asistencia - Boda Nicole y Pedro');
      const lines = [
          `Invitacion reservada para: ${formData.get('Invitación reservada para') || ''}`,
          `Cantidad reservada: ${formData.get('Cantidad reservada') || ''}`,
          `Confirmacion: ${formData.get('Confirmación') || ''}`,
          `Nombres de los asistentes: ${formData.get('Nombres de los asistentes') || ''}`,
          `Telefono de contacto: ${formData.get('Teléfono de contacto') || ''}`,
          `Mensaje para los novios: ${formData.get('Mensaje para los novios') || ''}`
      ];
      const body = encodeURIComponent(lines.join('\n'));
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      return true;
  }

  applyReservedGuestData();

  if (rsvpForm) {
      rsvpForm.addEventListener('submit', async function (event) {
          event.preventDefault();

          if (!rsvpForm.checkValidity()) {
              rsvpForm.reportValidity();
              return;
          }

          setRsvpStatus('Enviando confirmacion...', '');
          const submitButton = rsvpForm.querySelector('button[type="submit"]');
          if (submitButton) {
              submitButton.disabled = true;
          }

          const formData = new FormData(rsvpForm);

          try {
              const result = await submitRsvpToEndpoint(formData);
              if (result.ok) {
                  setRsvpStatus('Gracias. Tu confirmacion fue enviada con exito.', 'is-success');
                  rsvpForm.reset();
                  return;
              }

              if (result.reason === 'endpoint-unset' && sendRsvpByMailto(formData)) {
                  setRsvpStatus('Abrimos tu aplicacion de correo para completar el envio.', 'is-success');
                  return;
              }

              setRsvpStatus('No se pudo enviar en este momento. Intentalo de nuevo.', 'is-error');
          } catch (error) {
              if (sendRsvpByMailto(formData)) {
                  setRsvpStatus('Abrimos tu aplicacion de correo para completar el envio.', 'is-success');
              } else {
                  setRsvpStatus('No se pudo enviar en este momento. Intentalo de nuevo.', 'is-error');
              }
          } finally {
              if (submitButton) {
                  submitButton.disabled = false;
              }
          }
      });
  }
});

window.addEventListener('load', function () {
  const loader = document.getElementById('loader');
  const body = document.body;
    let loaderWasHidden = false;

    function hideLoader() {
            if (loaderWasHidden) return;
            loaderWasHidden = true;

            if (loader) {
                    loader.classList.add('loader-hidden');
            }

            body.classList.remove('loading');
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
                window.dispatchEvent(new Event('loader:hidden'));
    }

    if (!loader) {
            hideLoader();
            return;
    }

    loader.addEventListener('click', hideLoader);
    loader.addEventListener('touchstart', hideLoader, { passive: true });

    setTimeout(hideLoader, 2500);

    // Emergency fallback: in case a device stalls the loader animation.
    setTimeout(hideLoader, 7000);
});