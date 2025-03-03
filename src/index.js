// Base
function initNav() {
  const navbar = $('.nav');
  const scrollHeight = $(navbar).height();

  $(window).on('scroll', () => {
    if (navbar.length) {
      // First check if we've scrolled past initial threshold
      if (window.scrollY > scrollHeight) {
        navbar.addClass('fixed');
      } else {
        navbar.removeClass('fixed');
      }
    }
  });

  // Click
  // Function to create observer and handle class change
  function createObserver(targetSelector, callback) {
    const targetNodes = $(targetSelector);
    targetNodes.each(function () {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            callback(mutation.target);
          }
        });
      });
      observer.observe(this, { attributes: true, attributeFilter: ['class'] }); // Pass the DOM node directly
    });
  }
  function dropdownCallback(targetElement) {
    if ($(targetElement).hasClass('w--open')) {
      navbar.addClass('open');
    } else {
      navbar.removeClass('open');
    }
  }

  // Opened Menu
  // --- Scroll Disabler
  let scrollPosition;
  let menuOpen = false;

  const disableScroll = () => {
    dropdownCallback('.w-nav-button');
    if (!menuOpen) {
      scrollPosition = $(window).scrollTop();
      $('html, body').scrollTop(0).addClass('overflow-hidden');
      $('.nav').addClass('open');
    } else {
      $('html, body').scrollTop(scrollPosition).removeClass('overflow-hidden');
      $('.nav').removeClass('open');
    }
    menuOpen = !menuOpen;
  };

  // Create observers for the elements with their respective callbacks
  createObserver('.w-nav-button', disableScroll);
}
function initFS() {
  //Filter Reset Button
  window.fsAttributes = window.fsAttributes || [];
  // Filter
  window.fsAttributes.push([
    'cmsfilter',
    (filterInstances) => {
      // Ensure filterInstances is defined and not empty
      if (filterInstances && filterInstances.length > 0) {
        const [filterInstance] = filterInstances;

        // Check if filterInstance exists and resetButtonsData has keys
        if (
          filterInstance &&
          filterInstance.resetButtonsData &&
          filterInstance.resetButtonsData.size > 0
        ) {
          const resetBtn = [...filterInstance.resetButtonsData.keys()][0];

          // Check if filtersData exists and has the necessary data
          if (filterInstance.filtersData && filterInstance.filtersData[0]) {
            function updateResetBtn(entries) {
              if (entries >= 1) {
                if (resetBtn) {
                  $(resetBtn).removeClass('cc-active');
                }
              } else {
                if (resetBtn) {
                  $(resetBtn).addClass('cc-active');
                }
              }
            }

            // Init
            updateResetBtn(0);

            filterInstance.listInstance.on('renderitems', function () {
              let entries = filterInstance.filtersData[0].values.size;
              updateResetBtn(entries);
              initDynamicFilterBG();
            });
          }
        }
      }
    },
  ]);

  // Empty State Clear Button
  $('[data-empty-clear]').on('click', function () {
    let resetButton = $(this).closest('.section').find("[fs-cmsfilter-element='clear']");
    resetButton.trigger('click');
  });
}

// Dynamic Content
function initTabs() {
  $('[tabs-wrapper]').each(function () {
    // Store selectors as variables
    const wrapper = $(this);
    const tabItem = wrapper.find('[tabs-item]');
    const tabContent = wrapper.find('[tabs-content]');
    const activeClass = 'cc-active';
    const fadeDuration = 300;

    // Hide all tab content initially except the first one
    tabContent.not(':first').hide();

    // Add active class to first tab
    tabItem.eq(0).addClass(activeClass);

    // Click event handler for tab items
    tabItem.click(function () {
      // Don't do anything if this tab is already active
      if ($(this).hasClass(activeClass)) {
        return;
      }

      // Get the index of the clicked tab
      const tabIndex = tabItem.index($(this));

      // Remove active class from all tabs
      tabItem.removeClass(activeClass);

      // Add active class to clicked tab
      $(this).addClass(activeClass);

      // Get the target content to display
      const targetContent = tabContent.eq(tabIndex);

      // First hide all tab content
      tabContent.hide();

      // Show the target content but with opacity 0
      targetContent.css({
        display: 'block',
        opacity: 0,
      });

      // Then fade in the opacity
      targetContent.animate({ opacity: 1 }, fadeDuration);
    });
  });
}
function initDynamicContent() {
  $('[data-nest]').each(function () {
    let slug = $(this).attr('data-nest');
    let dataCollection = $(this).attr('data-collection');

    if (slug && dataCollection) {
      jQuery(`[data-nest="${slug}"]`).load(
        `/${dataCollection}/${slug} [data-nest-list]`,
        function (response, status) {
          if (status === 'success') {
            iniTags();
          } else {
          }
        }
      );
    }
  });
}
function iniTags() {
  $(document).ready(function () {
    // Find all instances of index_card-content_tags
    $('.index_card-content_tags').each(function () {
      // Find the internal link
      let internalLink = $(this)
        .closest('.index_card-wrap')
        .find('[data-link-internal]')
        .attr('href');

      // Flag for run
      let isLoaded = $(this).attr('data-loaded') === 'true';

      if (internalLink && !isLoaded) {
        // Get the slug value
        let slug = internalLink;

        // Store reference to the current tags container
        let tagsContainer = $(this);

        // Create a temporary div element to hold the loaded content
        let tempDiv = document.createElement('div');
        let $tempDiv = $(tempDiv);
        let tagItem = $(this).find('.content_tag');

        // Use jQuery.load to load the individual page content
        $tempDiv.load(slug + ' [data-tags]', function (response, status) {
          if (status === 'success') {
            // Find all p tags inside the loaded [data-tags] element
            let tagElements = $(this).find('[data-tags] p');

            if (tagElements.length) {
              // Clear existing list items
              tagsContainer.empty();

              // Create new list items based on the loaded tags
              tagElements.each(function () {
                let tagText = $(this).text();
                let newListItem = tagItem.clone();
                newListItem.text(tagText);
                tagsContainer.append(newListItem);
              });

              // Tag the list as initiliazed
              tagsContainer.attr('data-loaded', true);

              // We need to reset scrolltrigger as the height changes
              if (ScrollTrigger) {
                ScrollTrigger.refresh();
              }
            } else {
              tagsContainer.remove();
            }
          } else {
          }
        });
      }
    });
  });
}
function dynamicDropdownLabel() {
  $('.filter-drodown_list .filter-pill_item').on('click', function () {
    if ($(window).width() < 768) {
      let currentText = $(this).text();
      let dropdownLabel = $(this)
        .closest('.w-dropdown')
        .find('.w-dropdown-toggle [dropdown-label]');

      dropdownLabel.text(currentText);
    }
  });
}

// Animations
function rotatingBorders() {
  $('.border-gradient').each(function (index) {
    const $element = $(this);
    const delay = index * 800; // 800ms delay between each element

    // Set timeout to add the animation class
    setTimeout(function () {
      $element.addClass('trail-animation');
    }, delay);
  });
}
function initHeroChange() {
  // Create a matchMedia condition for screens 992px and wider
  let mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    $('html').each(function () {
      // This code will only run on screens 992px or wider
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: $(this), // Use body element instead of window
          start: '25% top', // Start at the top of the viewport
          toggleActions: 'play none none reverse',
        },
      });

      tl.to('.page-wrapper', {
        color: '#171717',
        backgroundColor: 'white',
      });
      tl.to(
        '[data-anim-invert]',
        {
          filter: 'invert(100%)', // Target value
        },
        '<'
      );

      // Return the timeline if you need to reference it elsewhere
      return tl;
    });
  });
}
function initDynamicFilterBG() {
  // Check if the required elements exist
  if ($('.filter-tags_bg').length === 0 || $('.filter-tags_item').length === 0) {
    return;
  }

  // Function to animate the background element to match the active tag
  function animateFilterBg() {
    // Find the currently active filter tag
    const $activeTag = $('.filter-tags_item.w-radio.cc-active');

    // If there's an active tag, animate the background
    if ($activeTag.length) {
      const $filterBg = $('.filter-tags_bg');

      // Get the position and dimensions of the active tag
      const tagWidth = $activeTag.outerWidth();
      const tagHeight = $activeTag.outerHeight();

      // Get the position and dimensions of the active tag
      const tagPosition = $activeTag.position(); // Use position() instead of offset() to get position relative to parent

      // Get the left position directly from position() which is already relative to the parent
      const leftPosition = tagPosition.left;

      // Animate the background element to match the active tag's position and width
      gsap.to($filterBg, {
        left: leftPosition,
        width: tagWidth,
        height: tagHeight,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }

  animateFilterBg();

  // Handle window resize to ensure the background stays properly positioned
  $(window).on('resize', function () {
    animateFilterBg();
  });
}
function animateCommunityBanner() {
  // Create the main timeline for all animations
  let mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.university_community_visual',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true,
    },
  });

  // Add the circle animation also at position 0
  mainTl.from(
    '.university_community_visual-circle path',
    {
      scale: 0.5,
      stagger: 0.2,
      ease: 'none',
      transformOrigin: '50% 50%',
      duration: 1, // Set duration to cover full timeline
    },
    0 // Start at the beginning
  );

  // Add all animations to start at position 0
  mainTl.to(
    '.university_community_visual-avatar_box',
    {
      rotate: 15,
      ease: 'none',
      duration: 1, // Set duration to cover full timeline
    },
    0 // Start at the beginning
  );

  mainTl.fromTo(
    $('.university_community_visual-avatar'),
    {
      rotate: 0,
      scale: function (i, el) {
        return $(el).hasClass('cc-main') ? 0.7 : 1;
      },
    },
    {
      rotate: -15,
      scale: function (i, el) {
        let isMain = $(el).hasClass('cc-main');
        return !isMain ? 1.1 : 1;
      },
      ease: 'none',
      duration: 1, // Set duration to cover full timeline
    },
    0 // Start at the beginning
  );
}
function initMarqueeScrollDirection() {
  document.querySelectorAll('[data-marquee-scroll-direction-target]').forEach((marquee) => {
    // Query marquee elements
    const marqueeContent = marquee.querySelector('[data-marquee-collection-target]');
    const marqueeScroll = marquee.querySelector('[data-marquee-scroll-target]');
    if (!marqueeContent || !marqueeScroll) return;

    // Get data attributes
    const {
      marqueeSpeed: speed,
      marqueeDirection: direction,
      marqueeDuplicate: duplicate,
      marqueeScrollSpeed: scrollSpeed,
    } = marquee.dataset;

    // Convert data attributes to usable types
    const marqueeSpeedAttr = parseFloat(speed);
    const marqueeDirectionAttr = direction === 'right' ? 1 : -1; // 1 for right, -1 for left
    const duplicateAmount = parseInt(duplicate || 0);
    const scrollSpeedAttr = parseFloat(scrollSpeed);
    const speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

    let marqueeSpeed =
      marqueeSpeedAttr * (marqueeContent.offsetWidth / window.innerWidth) * speedMultiplier;

    // Precompute styles for the scroll container
    marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
    marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`;

    // Duplicate marquee content
    if (duplicateAmount > 0) {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < duplicateAmount; i++) {
        fragment.appendChild(marqueeContent.cloneNode(true));
      }
      marqueeScroll.appendChild(fragment);
    }

    // GSAP animation for marquee content
    const marqueeItems = marquee.querySelectorAll('[data-marquee-collection-target]');
    const animation = gsap
      .to(marqueeItems, {
        xPercent: -100, // Move completely out of view
        repeat: -1,
        duration: marqueeSpeed,
        ease: 'linear',
      })
      .totalProgress(0.5);

    // Initialize marquee in the correct direction
    gsap.set(marqueeItems, { xPercent: marqueeDirectionAttr === 1 ? 100 : -100 });
    animation.timeScale(marqueeDirectionAttr); // Set correct direction
    animation.play(); // Start animation immediately

    // Set initial marquee status
    marquee.setAttribute('data-marquee-status', 'normal');

    // ScrollTrigger logic for direction inversion
    ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const isInverted = self.direction === 1; // Scrolling down
        const currentDirection = isInverted ? -marqueeDirectionAttr : marqueeDirectionAttr;

        // Update animation direction and marquee status
        animation.timeScale(currentDirection);
        marquee.setAttribute('data-marquee-status', isInverted ? 'normal' : 'inverted');
      },
    });

    // Extra speed effect on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: marquee,
        start: '0% 100%',
        end: '100% 0%',
        scrub: 0,
      },
    });

    const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
    const scrollEnd = -scrollStart;

    tl.fromTo(marqueeScroll, { x: `${scrollStart}vw` }, { x: `${scrollEnd}vw`, ease: 'none' });
  });
}

// Init
$(document).ready(function () {
  initNav();
  initTabs();
  initDynamicContent();
  iniTags();
  dynamicDropdownLabel();
  rotatingBorders();
  initFS();
  initHeroChange();
  initDynamicFilterBG();
  animateCommunityBanner();
  initMarqueeScrollDirection();
});
