window.sunder = window.sunder || {};
(function () {
    const CONTENT_IMAGE_SELECTOR = ".md-content .md-typeset img";
    const IMAGE_BASE_CLASS = "sunder-content-image";
    const IMAGE_ROOT_CLASS = "sunder-image";
    const IMAGE_INTERACTIVE_CLASS = "sunder-image--interactive";
    const LIGHTBOX_TRIGGER_CLASS = "sunder-lightbox-trigger";
    const IMAGE_FIGURE_CLASS = "sunder-content-figure";
    const IMAGE_CREDIT_CLASS = "sunder-image-credit";
    const CONTRIBUTOR_SLUGS = new Set([
        "luminoxity",
        "msasterisk",
        "mullburrower"
    ]);
    const IMAGE_LAYOUT_CLASSES = new Set([
        "sunder-image--left",
        "sunder-image--right",
        "sunder-image--center",
        "sunder-image--full"
    ]);
    const IMAGE_SIZE_CLASSES = new Set([
        "sunder-image--small",
        "sunder-image--medium",
        "sunder-image--large"
    ]);
    const VIEWER_OPEN_CLASS = "sunder-image-viewer-open";

    const state = {
        items: [],
        currentIndex: -1,
        fitScale: 1,
        zoom: 1,
        minZoom: 1,
        maxZoom: 4,
        translateX: 0,
        translateY: 0,
        isPanning: false,
        pointerId: null,
        dragStartX: 0,
        dragStartY: 0,
        lastFocused: null
    };

    let viewer = null;
    let viewerBackdrop = null;
    let viewerStage = null;
    let viewerViewport = null;
    let viewerImage = null;
    let viewerCaption = null;
    let viewerCount = null;
    let viewerZoom = null;
    let viewerPrev = null;
    let viewerNext = null;
    let viewerClose = null;

    function isViewerOpen() {
        return !!viewer && viewer.classList.contains("is-open");
    }

    function isRecognizedImageClass(className) {
        return className === IMAGE_BASE_CLASS ||
            className === IMAGE_ROOT_CLASS ||
            className.startsWith("sunder-image--");
    }

    function hasRecognizedImageClass(image) {
        return Array.from(image.classList).some(isRecognizedImageClass);
    }

    function hasLayoutClass(image) {
        return Array.from(image.classList).some((className) => IMAGE_LAYOUT_CLASSES.has(className));
    }

    function hasSizeClass(image) {
        return Array.from(image.classList).some((className) => IMAGE_SIZE_CLASSES.has(className));
    }

    function isExplicitImage(image) {
        return image.classList.contains(IMAGE_ROOT_CLASS) || hasRecognizedImageClass(image);
    }

    function shouldEnhanceImage(image) {
        if (!(image instanceof HTMLImageElement)) {
            return false;
        }

        if (!image.closest(".md-content .md-typeset")) {
            return false;
        }

        if (image.closest(".sunder-image-viewer")) {
            return false;
        }

        if (image.dataset.sunderLightbox === "off") {
            return false;
        }

        if (!image.currentSrc && !image.getAttribute("src")) {
            return false;
        }

        if (image.dataset.sunderLightbox === "on") {
            return true;
        }

        if (isExplicitImage(image)) {
            return true;
        }

        return image.classList.length === 0;
    }

    function getImageLabel(image) {
        const explicitLabel = image.getAttribute("aria-label");
        if (explicitLabel) {
            return explicitLabel;
        }

        const alt = (image.getAttribute("alt") || "").trim();
        if (alt) {
            return "Open image: " + alt;
        }

        return "Open image";
    }

    function normalizeImage(image) {
        const isLightboxOnly = image.dataset.sunderLightbox === "on" && !isExplicitImage(image);

        if (!isLightboxOnly) {
            image.classList.add(IMAGE_BASE_CLASS);

            if (!hasLayoutClass(image)) {
                image.classList.add("sunder-image--center");
            }

            if (!hasSizeClass(image) && !image.classList.contains("sunder-image--full")) {
                image.classList.add("sunder-image--medium");
            }

            image.classList.add(IMAGE_INTERACTIVE_CLASS);
        } else {
            image.classList.add(LIGHTBOX_TRIGGER_CLASS);
        }

        if (!image.hasAttribute("loading")) {
            image.loading = "lazy";
        }

        image.decoding = "async";

        if (!image.closest("a[href], button")) {
            if (!image.hasAttribute("tabindex")) {
                image.tabIndex = 0;
            }

            if (!image.hasAttribute("role")) {
                image.setAttribute("role", "button");
            }
        }

        image.setAttribute("aria-label", getImageLabel(image));
        syncImageAuthorCredit(image, isLightboxOnly);
    }

    function syncImageAuthorCredit(image, isLightboxOnly) {
        const author = (image.dataset.sunderAuthor || "").trim();
        const existingFigure = image.parentElement &&
            image.parentElement.classList &&
            image.parentElement.classList.contains(IMAGE_FIGURE_CLASS)
            ? image.parentElement
            : null;

        if (!author || isLightboxOnly) {
            if (existingFigure) {
                const staleCaption = existingFigure.querySelector("." + IMAGE_CREDIT_CLASS);
                if (staleCaption) {
                    staleCaption.remove();
                }
            }
            return;
        }

        const figure = existingFigure || createImageFigure(image);
        syncFigureClasses(figure, image);

        let caption = figure.querySelector("." + IMAGE_CREDIT_CLASS);
        if (!caption) {
            caption = document.createElement("figcaption");
            caption.className = IMAGE_CREDIT_CLASS;
            figure.appendChild(caption);
        }

        renderImageAuthorCredit(caption, author);
    }

    function renderImageAuthorCredit(caption, author) {
        const trimmedAuthor = author.trim();
        const normalizedAuthor = trimmedAuthor.replace(/^@+/, "").trim().toLowerCase();

        caption.replaceChildren();
        caption.appendChild(document.createTextNode("Art by "));

        if (normalizedAuthor && CONTRIBUTOR_SLUGS.has(normalizedAuthor)) {
            const link = document.createElement("a");
            link.href = getContributorUrl(normalizedAuthor);
            link.textContent = "@" + normalizedAuthor;
            caption.appendChild(link);
            return;
        }

        caption.appendChild(document.createTextNode(trimmedAuthor));
    }

    function getContributorUrl(slug) {
        const base = (window.SUNDER_BASE_URL || "").replace(/\/$/, "");
        return base + "/meta/contributors/" + encodeURIComponent(slug) + "/";
    }

    function createImageFigure(image) {
        const figure = document.createElement("figure");
        figure.className = IMAGE_FIGURE_CLASS;

        const wrapperParagraph = findStandaloneImageParagraph(image);

        if (wrapperParagraph && wrapperParagraph.parentNode) {
            wrapperParagraph.parentNode.insertBefore(figure, wrapperParagraph);
            figure.appendChild(image);
            wrapperParagraph.remove();
            return figure;
        }

        image.parentNode.insertBefore(figure, image);
        figure.appendChild(image);

        return figure;
    }

    function findStandaloneImageParagraph(image) {
        const directParent = image.parentElement;

        if (directParent && directParent.tagName === "P" && paragraphOnlyContains(directParent, image)) {
            return directParent;
        }

        if (
            directParent &&
            directParent.tagName === "A" &&
            directParent.parentElement &&
            directParent.parentElement.tagName === "P" &&
            paragraphOnlyContains(directParent.parentElement, directParent)
        ) {
            return directParent.parentElement;
        }

        return null;
    }

    function paragraphOnlyContains(paragraph, primaryNode) {
        return Array.from(paragraph.childNodes).every((node) => {
            if (node === primaryNode) {
                return true;
            }

            return node.nodeType === Node.TEXT_NODE && !node.textContent.trim();
        });
    }

    function syncFigureClasses(figure, image) {
        Array.from(figure.classList).forEach((className) => {
            if (className.startsWith("sunder-image--")) {
                figure.classList.remove(className);
            }
        });

        Array.from(image.classList).forEach((className) => {
            if (className.startsWith("sunder-image--") && className !== IMAGE_INTERACTIVE_CLASS) {
                figure.classList.add(className);
            }
        });
    }

    function bindImageEvents(image) {
        if (image.dataset.sunderImageBound === "true") {
            return;
        }

        image.addEventListener("click", onImageClick);
        image.addEventListener("keydown", onImageKeydown);
        image.dataset.sunderImageBound = "true";
    }

    function refreshImageList() {
        const images = Array.from(document.querySelectorAll(CONTENT_IMAGE_SELECTOR))
            .filter(shouldEnhanceImage);

        images.forEach((image, index) => {
            normalizeImage(image);
            bindImageEvents(image);
            image.dataset.sunderImageIndex = String(index);
        });

        state.items = images;

        if (isViewerOpen()) {
            updateNavigationState();
        }
    }

    function ensureViewer() {
        if (viewer) {
            return viewer;
        }

        viewer = document.createElement("div");
        viewer.className = "sunder-image-viewer";
        viewer.setAttribute("role", "dialog");
        viewer.setAttribute("aria-modal", "true");
        viewer.setAttribute("aria-label", "Image viewer");
        viewer.setAttribute("aria-hidden", "true");
        viewer.innerHTML = `
            <div class="sunder-image-viewer__backdrop"></div>
            <div class="sunder-image-viewer__shell" role="document">
                <div class="sunder-image-viewer__toolbar">
                    <div class="sunder-image-viewer__meta">
                        <div class="sunder-image-viewer__count">0 / 0</div>
                        <div class="sunder-image-viewer__caption">Image viewer</div>
                    </div>
                    <div class="sunder-image-viewer__controls">
                        <button type="button" class="sunder-image-viewer__btn" data-action="zoom-out" aria-label="Zoom out">
                            <i class="fa-solid fa-magnifying-glass-minus"></i>
                        </button>
                        <button type="button" class="sunder-image-viewer__btn" data-action="zoom-in" aria-label="Zoom in">
                            <i class="fa-solid fa-magnifying-glass-plus"></i>
                        </button>
                        <button type="button" class="sunder-image-viewer__btn" data-action="reset-zoom" aria-label="Reset zoom">
                            <span class="sunder-image-viewer__zoom">100%</span>
                        </button>
                        <button type="button" class="sunder-image-viewer__btn" data-action="close" aria-label="Close image viewer">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <div class="sunder-image-viewer__stage">
                    <button type="button" class="sunder-image-viewer__btn sunder-image-viewer__nav sunder-image-viewer__nav--prev" data-action="previous" aria-label="Show previous image">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <button type="button" class="sunder-image-viewer__btn sunder-image-viewer__nav sunder-image-viewer__nav--next" data-action="next" aria-label="Show next image">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                    <div class="sunder-image-viewer__viewport">
                        <img class="sunder-image-viewer__image" src="" alt="" />
                    </div>
                    <div class="sunder-image-viewer__hint">Scroll to zoom. Drag when zoomed. Arrow keys change images.</div>
                </div>
            </div>
        `;

        document.body.appendChild(viewer);

        viewerBackdrop = viewer.querySelector(".sunder-image-viewer__backdrop");
        viewerStage = viewer.querySelector(".sunder-image-viewer__stage");
        viewerViewport = viewer.querySelector(".sunder-image-viewer__viewport");
        viewerImage = viewer.querySelector(".sunder-image-viewer__image");
        viewerCaption = viewer.querySelector(".sunder-image-viewer__caption");
        viewerCount = viewer.querySelector(".sunder-image-viewer__count");
        viewerZoom = viewer.querySelector(".sunder-image-viewer__zoom");
        viewerPrev = viewer.querySelector(".sunder-image-viewer__nav--prev");
        viewerNext = viewer.querySelector(".sunder-image-viewer__nav--next");
        viewerClose = viewer.querySelector('[data-action="close"]');

        viewer.addEventListener("click", onViewerClick);
        viewerBackdrop.addEventListener("click", closeViewer);
        viewerImage.addEventListener("load", () => {
            resetView();
        });

        viewerStage.addEventListener("wheel", onViewerWheel, { passive: false });
        viewerStage.addEventListener("dblclick", onViewerDoubleClick);
        viewerStage.addEventListener("pointerdown", onPointerDown);
        viewerStage.addEventListener("pointermove", onPointerMove);
        viewerStage.addEventListener("pointerup", onPointerUp);
        viewerStage.addEventListener("pointercancel", onPointerUp);

        window.addEventListener("keydown", onWindowKeydown);
        window.addEventListener("resize", () => {
            if (isViewerOpen()) {
                updateFittedImageSize();
                clampTranslation();
                applyTransform();
            }
        });

        return viewer;
    }

    function onImageClick(event) {
        const image = event.currentTarget;
        const index = Number(image.dataset.sunderImageIndex);

        if (Number.isNaN(index)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        openViewer(index);
    }

    function onImageKeydown(event) {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        const image = event.currentTarget;
        const index = Number(image.dataset.sunderImageIndex);
        if (Number.isNaN(index)) {
            return;
        }

        event.preventDefault();
        openViewer(index);
    }

    function onViewerClick(event) {
        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) {
            return;
        }

        const action = actionButton.getAttribute("data-action");
        if (!action) {
            return;
        }

        event.preventDefault();

        if (action === "close") {
            closeViewer();
            return;
        }

        if (action === "next") {
            showRelativeImage(1);
            return;
        }

        if (action === "previous") {
            showRelativeImage(-1);
            return;
        }

        if (action === "zoom-in") {
            setZoom(state.zoom + 0.25);
            return;
        }

        if (action === "zoom-out") {
            setZoom(state.zoom - 0.25);
            return;
        }

        if (action === "reset-zoom") {
            resetView();
        }
    }

    function onWindowKeydown(event) {
        if (!isViewerOpen()) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeViewer();
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            showRelativeImage(1);
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            showRelativeImage(-1);
            return;
        }

        if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            setZoom(state.zoom + 0.25);
            return;
        }

        if (event.key === "-") {
            event.preventDefault();
            setZoom(state.zoom - 0.25);
            return;
        }

        if (event.key === "0") {
            event.preventDefault();
            resetView();
        }
    }

    function onViewerWheel(event) {
        if (!isViewerOpen()) {
            return;
        }

        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.2 : -0.2;
        setZoom(state.zoom + delta);
    }

    function onViewerDoubleClick(event) {
        event.preventDefault();
        if (state.zoom > 1.2) {
            resetView();
            return;
        }

        setZoom(2);
    }

    function onPointerDown(event) {
        if (!isViewerOpen() || state.zoom <= 1) {
            return;
        }

        state.isPanning = true;
        state.pointerId = event.pointerId;
        state.dragStartX = event.clientX - state.translateX;
        state.dragStartY = event.clientY - state.translateY;

        if (viewerStage.setPointerCapture) {
            viewerStage.setPointerCapture(event.pointerId);
        }

        viewerStage.classList.add("is-panning");
        event.preventDefault();
    }

    function onPointerMove(event) {
        if (!state.isPanning || event.pointerId !== state.pointerId) {
            return;
        }

        state.translateX = event.clientX - state.dragStartX;
        state.translateY = event.clientY - state.dragStartY;
        clampTranslation();
        applyTransform();
    }

    function onPointerUp(event) {
        if (!state.isPanning || (state.pointerId !== null && event.pointerId !== state.pointerId)) {
            return;
        }

        state.isPanning = false;
        state.pointerId = null;

        if (viewerStage.releasePointerCapture && event.pointerId !== undefined) {
            try {
                viewerStage.releasePointerCapture(event.pointerId);
            } catch (_error) {
                // Ignore release failures after implicit pointer release.
            }
        }

        viewerStage.classList.remove("is-panning");
    }

    function openViewer(index) {
        ensureViewer();
        refreshImageList();

        if (!state.items.length) {
            return;
        }

        state.lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        viewer.classList.add("is-open");
        viewer.setAttribute("aria-hidden", "false");
        document.body.classList.add(VIEWER_OPEN_CLASS);

        showImage(index);

        if (viewerClose) {
            viewerClose.focus();
        }
    }

    function closeViewer() {
        if (!isViewerOpen()) {
            return;
        }

        onPointerUp({ pointerId: state.pointerId });

        viewer.classList.remove("is-open");
        viewer.setAttribute("aria-hidden", "true");
        document.body.classList.remove(VIEWER_OPEN_CLASS);

        if (state.lastFocused) {
            try {
                state.lastFocused.focus();
            } catch (_error) {
                // Ignore focus restore failures if the source element was replaced.
            }
        }

        state.lastFocused = null;
        state.currentIndex = -1;
    }

    function showRelativeImage(offset) {
        if (!state.items.length) {
            return;
        }

        const nextIndex = (state.currentIndex + offset + state.items.length) % state.items.length;
        showImage(nextIndex);
    }

    function showImage(index) {
        if (!state.items.length) {
            return;
        }

        const normalizedIndex = ((index % state.items.length) + state.items.length) % state.items.length;
        const sourceImage = state.items[normalizedIndex];
        const source = sourceImage.currentSrc || sourceImage.src || sourceImage.getAttribute("src");

        state.currentIndex = normalizedIndex;

        viewerImage.alt = (sourceImage.getAttribute("alt") || "").trim();
        viewerCaption.textContent = viewerImage.alt || "Image";
        viewerCount.textContent = (normalizedIndex + 1) + " / " + state.items.length;

        if (viewerImage.src !== source) {
            viewerImage.src = source;
        } else {
            resetView();
        }

        updateNavigationState();
    }

    function updateNavigationState() {
        const hasMultipleImages = state.items.length > 1;
        viewerPrev.hidden = !hasMultipleImages;
        viewerNext.hidden = !hasMultipleImages;
    }

    function resetView() {
        updateFittedImageSize();
        state.zoom = 1;
        state.translateX = 0;
        state.translateY = 0;
        clampTranslation();
        applyTransform();
    }

    function setZoom(nextZoom) {
        const clampedZoom = Math.min(state.maxZoom, Math.max(state.minZoom, nextZoom));
        state.zoom = clampedZoom;

        if (state.zoom <= 1) {
            state.translateX = 0;
            state.translateY = 0;
        }

        clampTranslation();
        applyTransform();
    }

    function clampTranslation() {
        if (!viewerStage || !viewerImage) {
            return;
        }

        const stageWidth = viewerStage.clientWidth;
        const stageHeight = viewerStage.clientHeight;

        if (state.zoom <= 1) {
            state.translateX = 0;
            state.translateY = 0;
            return;
        }

        const naturalWidth = viewerImage.naturalWidth || stageWidth;
        const naturalHeight = viewerImage.naturalHeight || stageHeight;

        if (!naturalWidth || !naturalHeight) {
            return;
        }
        const fittedWidth = naturalWidth * state.fitScale;
        const fittedHeight = naturalHeight * state.fitScale;

        const overflowX = Math.max(0, (fittedWidth * state.zoom - stageWidth) / 2);
        const overflowY = Math.max(0, (fittedHeight * state.zoom - stageHeight) / 2);

        state.translateX = Math.max(-overflowX, Math.min(overflowX, state.translateX));
        state.translateY = Math.max(-overflowY, Math.min(overflowY, state.translateY));
    }

    function applyTransform() {
        if (!viewerImage) {
            return;
        }

        viewerImage.style.transform =
            "translate(" + state.translateX + "px, " + state.translateY + "px) scale(" + state.zoom + ")";

        if (viewerZoom) {
            viewerZoom.textContent = Math.round(state.fitScale * state.zoom * 100) + "%";
        }

        if (viewerStage) {
            viewerStage.classList.toggle("is-zoomed", state.zoom > 1);
            viewerStage.classList.toggle("is-panning", state.isPanning);
        }
    }

    function initialize() {
        refreshImageList();
        ensureViewer();
    }

    function updateFittedImageSize() {
        if (!viewerImage || !viewerViewport) {
            return;
        }

        const naturalWidth = viewerImage.naturalWidth;
        const naturalHeight = viewerImage.naturalHeight;

        if (!naturalWidth || !naturalHeight) {
            return;
        }

        const viewportStyles = window.getComputedStyle(viewerViewport);
        const horizontalPadding =
            (parseFloat(viewportStyles.paddingLeft) || 0) +
            (parseFloat(viewportStyles.paddingRight) || 0);
        const verticalPadding =
            (parseFloat(viewportStyles.paddingTop) || 0) +
            (parseFloat(viewportStyles.paddingBottom) || 0);

        const availableWidth = Math.max(1, viewerViewport.clientWidth - horizontalPadding);
        const availableHeight = Math.max(1, viewerViewport.clientHeight - verticalPadding);

        state.fitScale = Math.min(
            availableWidth / naturalWidth,
            availableHeight / naturalHeight,
            1
        );

        viewerImage.style.width = Math.max(1, Math.round(naturalWidth * state.fitScale)) + "px";
        viewerImage.style.height = Math.max(1, Math.round(naturalHeight * state.fitScale)) + "px";
    }

    const materialDocumentStream =
        (typeof document$ !== "undefined" && document$ && typeof document$.subscribe === "function")
            ? document$
            : null;

    if (materialDocumentStream) {
        materialDocumentStream.subscribe(() => {
            refreshImageList();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }

    window.sunder.imageViewer = {
        open: openViewer,
        refresh: refreshImageList
    };
})();
