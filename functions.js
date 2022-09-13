var DJCCP = DJCCP || {};

DJCCP.explainer = {
	init: function() {
		this.handlers();
		this.animations();
	},
	handlers: function() {
	},
	animations: function() {

    if (gsap) {

      gsap.registerPlugin(ScrollTrigger);

      let mediaCols = gsap.utils.toArray('.media-column');
      let copyCols = gsap.utils.toArray('.copy-column');
      let panels = gsap.utils.toArray('.explainer-panel-container');
			let blocks = document.querySelectorAll('.article-explainer');
			let orientation;
			let mediaType;
			let theme;

			$(".explainer-panels").append(DOMPurify.sanitize("<ul class='explainer-progress'></ul>", {SAFE_FOR_JQUERY: true}));
			var ul = document.querySelector(".explainer-progress");
			ul.style.display = "none";

			let activePanel = 0;

			function trackIt(cat,act,lab) {
				DJCCP.analytics.trackEvent(cat, act, lab);
			}

			function setItOn(index) {
				$('.explainer-progress .active').removeClass('active');
				var activeLi = $(`#dot-${index}`);
				activeLi.addClass('active');
				orientation = "Pinned";
				panels[index].querySelector(".explainer-video") ? mediaType = "Video" : mediaType = "Image";
				trackIt('Explainer', `View | Panel ${index + 1} of ${panels.length} | ${orientation}`, `Media Type: ${mediaType}`);
			}

			function setItOff(index) {
				$('.explainer-progress .active').removeClass('active');
			}

			function startVideo(videoId) {
				//play the video that's inside
				$('.explainer-video').each(function(){
					window._wq = window._wq || [];
					_wq.push( {
						id: videoId,
						onReady( video ) {
							video.play();
						}
					});
				});
			}


			// stop video by id
			function stopVideo(videoId) {
				//pause the panel's video
				_wq.push({
					id: videoId,
					onReady( video ) {
						video.pause();
					}
				});
			}

			// anytime a video plays, pause all other videos
			_wq.push({
					id: "_all",
					onReady: function (video) {
							video.bind("play", function () {
									var allVideos = Wistia.api.all();
									for (var i = 0; i < allVideos.length; i++) {
											if (allVideos[i].hashedId() !== video.hashedId()) {
													allVideos[i].pause();
											}
									}
							});
					}
			});

			// panels timeline
			const pinTl = gsap.timeline({
				scrollTrigger: {
					trigger: ".explainer-panel-container",
					pin: ".panel-wrapper",
					start: "center center",
					end: "+=" + document.querySelector(".explainer-panel-container").offsetWidth,
					onEnter: () => {
						if ($(window).width() >= 768) {
							ul.style.display = "block";
							ul.querySelector("li").classList.add("active");
						}
					},
					onLeave: () => {
						ul.style.display = "none"
					},
					onEnterBack: () => {
						ul.style.display = "block";
						setItOn(panels.length - 1);
					},
					onLeaveBack: () => {
						ul.style.display = "none"
					},
					toggleActions: "play pause resume pause",
					scrub: true,
					anticipatePin: 1
				}
			});

			ScrollTrigger.matchMedia({

				//desktop
				"(min-width: 768px)": function() {

					// loop over panels
					panels.forEach(function(elem, i) {

						if (elem.querySelector(".exp-cta")) {
							let cta = elem.querySelector(".exp-cta");
							cta.addEventListener("click", function() {
								return trackIt('Explainer', `Click | Panel ${i + 1} of ${panels.length} | ${orientation}`, `CTA: ${this.innerText}`);
							})
						}

						elem.setAttribute("id",`panel-${i}`);

						var li = document.createElement("li");

						li.setAttribute("id", `dot-${i}`);

						let liCount = document.querySelectorAll("[id^='dot']").length;

						if (liCount <= panels.length) {
							ul.appendChild(li);
						}

						let dataSrc = '';
						activePanel = i;

						pinTl.add(() => {
							pinTl.scrollTrigger.direction > 0 ? setItOn(i) : setItOff(i);
						});

						if (elem.querySelector('.explainer-video')) {
							dataSrc = elem.querySelector('.explainer-video').getAttribute(['data-video-id']);
						}

						if (dataSrc != '') {
							// // vid start / pause logic
							pinTl.add(() => {
								pinTl.scrollTrigger.direction > 0 ? startVideo(dataSrc) : stopVideo(dataSrc)
							});
						}

						if (i != 0) {
							// panel enter animations for all except 1st panel
							pinTl.from(elem.querySelector('.media-column'), {
									autoAlpha:0,
								}, i
							)
						}

						//scroll the copy column text up from bottom
						pinTl.from(elem.querySelector('.copy-column'), {
								autoAlpha:0,
								translateY: 300,
							}, i
						)

						// panel exit animations
						if (i != panels.length - 1) {
							pinTl.to(elem.querySelector('.copy-column'), {
									autoAlpha:0,
									translateY: -300
								}, i + 0.75
							)
							pinTl.to(elem.querySelector('.media-column'), {
									autoAlpha:0,
								}, i + 0.75
							)
						}

						if (dataSrc != '') {
							// vid start / pause logic
							pinTl.add(() => {
								pinTl.scrollTrigger.direction > 0 ? stopVideo(dataSrc) : startVideo(dataSrc)
							});
						}

						pinTl.add(() => {
							pinTl.scrollTrigger.direction > 0 ? setItOff(i) : setItOn(i);
						});

					});

					// // add a tiny amount of empty space at the end of the timeline so that the playhead trips the final callback in both directions
					pinTl.to({}, {duration: 0.25});

					return function() {
						pinTl.kill();
					};

				},

				"(max-width: 767px)": function() {

					//set base values so it refreshes on resize
					gsap.set(copyCols, {
							autoAlpha: 1,
							translateY: 0
						}
					)

					gsap.set(mediaCols, {
							autoAlpha: 1
						}
					)

					//mobile scrollTrigger
					const mobileTl = gsap.timeline();

					orientation = "Inline";

					panels.forEach((elem, i) => {

						if (elem.querySelector(".exp-cta")) {
							let cta = elem.querySelector(".exp-cta");
							cta.addEventListener("click", function() {
								return trackIt('Explainer', `Click | Panel ${i + 1} of ${panels.length} | ${orientation}`, `CTA: ${this.innerText}`);
							})
						}

						elem.querySelector(".explainer-video") ? mediaType = "Video" : mediaType = "Image";

						mobileTl.to(elem, {
							scrollTrigger: {
								trigger: elem,
								toggleClass: "active",
								onEnter: () => {
									trackIt('Explainer', `View | Panel ${i + 1} of ${panels.length} | ${orientation}`, `Media Type: ${mediaType}`);
								},
								onEnterBack: () => {
									trackIt('Explainer', `View | Panel ${i + 1} of ${panels.length} | ${orientation}`, `Media Type: ${mediaType}`);
								},
								onUpdate: () => {
									let videoPanel = elem.querySelector(".active .explainer-video");
									if (videoPanel) {
										videoId = videoPanel.getAttribute('data-video-id');
										startVideo(videoId);
									}
								},
								onLeave: () => {
									let videoPanel = elem.querySelector(".explainer-video");
									if (videoPanel) {
										videoId = videoPanel.getAttribute('data-video-id');
										stopVideo(videoId);
									}
								}
							}
						})

					})

					return function() {
						mobileTl.kill();
					};

				}
			});
    }
	}
};

document.addEventListener('DOMContentLoaded', function() {
	DJCCP.explainer.init();
}, true);
