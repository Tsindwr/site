window.SUNDER_LLM = (() => {
    let engine = null;
    let enginePromise = null;
    let status = 'off';
    let warmed = false;
    const listeners = new Set();

    function emit() {
        for (const cb of listeners) cb(status);
    }

    function onStatusChange(cb) {
        listeners.add(cb);
        cb(status);
        return () => listeners.delete(cb);
    }

    function isSupported() {
        return !!navigator.gpu;
    }

    async function requestPersistentStorage() {
        if (!navigator.storage?.persist) return false;
        try {
            const already = await navigator.storage.persisted?.();
            if (already) return true;
            return await navigator.storage.persist();
        } catch (err) {
            console.warn("[sunder-llm] persist() failed", err);
            return false;
        }
    }

    async function warmup() {
        const llm = await ensureEngine();
        if (warmed) return llm;

        try {
            await llm.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a test assistant." },
                    { role: "user", content: "Reply with only: ok" },
                ],
                temperature: 0,
                max_tokens: 2,
                stream: false,
            });

            await llm.getMessage();
            warmed = true;
            return llm;
        } catch (err) {
            console.error('[sunder-llm] warmup failed', err);
            throw err;
        }
    }

    async function ensureEngine() {
        if (engine) return engine;
        if (enginePromise) return enginePromise;

        await requestPersistentStorage();

        if (!isSupported()) {
            throw new Error('WebGPU is not available on this browser/device.');
        }

        status = 'loading';
        emit();

        enginePromise = (async () => {
            const { CreateMLCEngine } = await import("https://esm.run/@mlc-ai/web-llm");

            const model = window.SUNDER_LLM_MODEL;
            if (!model) {
                throw new Error("window.SUNDER_LLM_MODEL is not set.");
            }

            const llm = await CreateMLCEngine(model, {
                initProgressCallback: (report) => {
                    if (typeof report?.progress === 'number') {
                        status = `loading:${Math.round(report.progress * 100)}`;
                        emit();
                    }
                },
            });

            engine = llm;
            status = 'ready'
            emit();
            return llm;
        })().catch((err) => {
            console.error("[sunder-llm] init failed", err);
            enginePromise = null;
            status = 'error';
            emit();
            throw err;
        });

        return enginePromise;
    }

    async function streamComplete({
        system,
        user,
        context,
        temperature = 0.2,
        max_tokens = 260,
        onToken,
    }) {
        const llm = await ensureEngine();

        const messages = [
            { role: "system", content: system },
            { role: "user", content: `${context}\n\nUser question: ${user}` },
        ];

        const chunks = await llm.chat.completions.create({
            messages,
            temperature,
            max_tokens,
            stream: true,
            stream_options: { include_usage: true },
        });

        let reply = "";

        for await (const chunk of chunks) {
            const delta = chunk.choices?.[0]?.delta?.content || "";
            if (delta) {
                reply += delta;
                if (onToken) onToken(reply, delta);
            }
        }

        const fullReply = await llm.getMessage();
        return (fullReply || reply || "").trim();
    }

    async function complete({ system, user, context, temperature = 0.2, max_tokens = 260 }) {
        const llm = await ensureEngine();
        const messages = [
            { role: "system", content: system },
            { role: "user", content: `${context}\n\nUser question: ${user}` },
        ];

        const result = await llm.chat.completions.create({
            messages,
            temperature,
            max_tokens,
            stream: false,
        });

        return result?.choices?.[0]?.message?.content?.trim() || "";
    }

    return {
        isSupported,
        ensureEngine,
        warmup,
        complete,
        streamComplete,
        onStatusChange,
        getStatus: () => status,
    };
})();