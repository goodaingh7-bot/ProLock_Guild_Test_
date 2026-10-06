const SUPABASE_URL =
    "https://zqpvpqtdrnntoqorwumk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_NL3BBWY2j59f7gjXrkzzzw_YtoWgLcs";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ================= HELPERS ================= */

const $ = (selector) => document.querySelector(selector);

function showMessage(element, message, type = "error") {

    if (!element) return;

    element.textContent = message;

    element.className = `form-message show ${type}`;
}


function hideMessage(element) {

    if (!element) return;

    element.className = "form-message";
    element.textContent = "";
}


function showToast(message) {

    const toast = $("#toast");
    const text = $("#toastText");

    if (!toast || !text) return;

    text.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


/* ================= NAVIGATION ================= */

function showSection(sectionId) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.remove("active");
    });

    const target = document.getElementById(sectionId);

    if (!target) return;

    target.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function setupNavigation() {

    document.querySelectorAll("[data-section]").forEach(button => {

        button.addEventListener("click", () => {

            const section = button.dataset.section;

            showSection(section);

        });

    });
}


/* ================= SERVER ================= */

function setupServerFields() {

    const server = $("#server");
    const otherField = $("#otherServerField");
    const otherInput = $("#otherServer");

    if (server) {

        server.addEventListener("change", () => {

            if (server.value === "Other Server") {

                otherField.classList.add("show");
                otherInput.required = true;

            } else {

                otherField.classList.remove("show");
                otherInput.required = false;
                otherInput.value = "";
            }

        });

    }


    const gvgServer = $("#gvgServer");
    const gvgOtherField = $("#gvgOtherServerField");
    const gvgOtherInput = $("#gvgOtherServer");

    if (gvgServer) {

        gvgServer.addEventListener("change", () => {

            if (gvgServer.value === "Other Server") {

                gvgOtherField.classList.add("show");
                gvgOtherInput.required = true;

            } else {

                gvgOtherField.classList.remove("show");
                gvgOtherInput.required = false;
                gvgOtherInput.value = "";
            }

        });

    }
}


/* ================= SUCCESS MODAL ================= */

function openSuccessModal(code, type) {

    const modal = $("#successModal");

    $("#trackingCode").textContent = code;

    $("#successText").textContent =
        `${type} application submitted successfully. Save your tracking code to check your status later.`;

    modal.classList.remove("hidden");

    document.body.style.overflow = "hidden";
}


function closeSuccessModal() {

    const modal = $("#successModal");

    modal.classList.add("hidden");

    document.body.style.overflow = "";
}


/* ================= GUILD TEST ================= */

function setupGuildTestForm() {

    const form = $("#guildTestForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const message = $("#guildFormMessage");

        hideMessage(message);


        const name = $("#playerName").value.trim();
        const uid = $("#playerUID").value.trim();
        const serverSelect = $("#server").value;
        const otherServer = $("#otherServer").value.trim();
        const testType = $("#testType").value;


        const server =
            serverSelect === "Other Server"
                ? otherServer
                : serverSelect;


        if (!name || !uid || !server || !testType) {

            showMessage(
                message,
                "Please fill all required fields."
            );

            return;
        }


        if (!/^\d+$/.test(uid)) {

            showMessage(
                message,
                "UID should contain numbers only."
            );

            return;
        }


        const trackingCode = crypto.randomUUID();


        const submitButton = form.querySelector("button[type='submit']");

        submitButton.disabled = true;
        submitButton.innerHTML = "Submitting...";


        try {

            const { error } =
                await supabaseClient
                    .from("submissions")
                    .insert({
                        name: name,
                        uid: uid,
                        server: server,
                        test_type: testType,
                        submission_type: "guild_test",
                        tracking_code: trackingCode,
                        status: "pending"
                    });


            if (error) {
                throw error;
            }


            localStorage.setItem(
                "plg_last_tracking",
                trackingCode
            );


            openSuccessModal(
                trackingCode,
                "Guild Test"
            );


            form.reset();

            $("#otherServerField").classList.remove("show");
            $("#otherServer").required = false;

        } catch (error) {

            console.error(error);

            showMessage(
                message,
                "Submission failed. Please try again."
            );

        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                `Submit Guild Test <span>→</span>`;
        }

    });
}


/* ================= GVG ================= */

function setupGVGForm() {

    const form = $("#gvgForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const message = $("#gvgFormMessage");

        hideMessage(message);


        const guildName = $("#guildName").value.trim();
        const leaderName = $("#leaderName").value.trim();
        const leaderUID = $("#leaderUID").value.trim();

        const serverSelect = $("#gvgServer").value;
        const otherServer = $("#gvgOtherServer").value.trim();


        const server =
            serverSelect === "Other Server"
                ? otherServer
                : serverSelect;


        if (
            !guildName ||
            !leaderName ||
            !leaderUID ||
            !server
        ) {

            showMessage(
                message,
                "Please fill all required fields."
            );

            return;
        }


        if (!/^\d+$/.test(leaderUID)) {

            showMessage(
                message,
                "Leader UID should contain numbers only."
            );

            return;
        }


        const trackingCode = crypto.randomUUID();


        const submitButton =
            form.querySelector("button[type='submit']");

        submitButton.disabled = true;
        submitButton.innerHTML = "Submitting...";


        try {

            const { error } =
                await supabaseClient
                    .from("submissions")
                    .insert({
                        guild_name: guildName,
                        leader_name: leaderName,
                        leader_uid: leaderUID,
                        server: server,
                        submission_type: "gvg",
                        tracking_code: trackingCode,
                        status: "pending"
                    });


            if (error) {
                throw error;
            }


            localStorage.setItem(
                "plg_last_tracking",
                trackingCode
            );


            openSuccessModal(
                trackingCode,
                "GVG"
            );


            form.reset();

            $("#gvgOtherServerField").classList.remove("show");
            $("#gvgOtherServer").required = false;

        } catch (error) {

            console.error(error);

            showMessage(
                message,
                "Submission failed. Please try again."
            );

        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                `Submit GVG Challenge <span>→</span>`;
        }

    });
}


/* ================= STATUS ================= */

function setupStatus() {

    const checkButton = $("#checkStatusBtn");
    const input = $("#trackingInput");
    const refresh = $("#refreshStatus");


    async function loadStatus() {

        const code = input.value.trim();

        if (!code) {

            showToast("Enter your tracking code first.");

            return;
        }


        const originalText = checkButton.innerHTML;

        checkButton.disabled = true;
        checkButton.innerHTML = "Checking...";


        try {

            const { data, error } =
                await supabaseClient
                    .rpc(
                        "get_submission_status",
                        {
                            code: code
                        }
                    );


            if (error) {
                throw error;
            }


            if (!data || data.length === 0) {

                $("#statusEmpty").classList.remove("hidden");
                $("#statusResult").classList.add("hidden");

                showToast("Application not found.");

                return;
            }


            const application = data[0];

            renderStatus(application);

        } catch (error) {

            console.error(error);

            showToast(
                "Unable to check status right now."
            );

        } finally {

            checkButton.disabled = false;
            checkButton.innerHTML = originalText;
        }
    }


    checkButton.addEventListener(
        "click",
        loadStatus
    );


    refresh.addEventListener(
        "click",
        loadStatus
    );


    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            loadStatus();
        }

    });


    const savedCode =
        localStorage.getItem("plg_last_tracking");

    if (savedCode) {
        input.value = savedCode;
    }

}


function renderStatus(application) {

    $("#statusEmpty").classList.add("hidden");
    $("#statusResult").classList.remove("hidden");


    const type =
        application.submission_type === "gvg"
            ? "GVG Challenge"
            : "Guild Test";


    $("#statusApplicationType").textContent =
        type;


    const status =
        (application.status || "pending").toLowerCase();


    const badge = $("#statusBadge");

    badge.textContent =
        status.toUpperCase();

    badge.className =
        `status-badge ${status}`;


    $("#statusName").textContent =
        application.submission_type === "gvg"
            ? application.leader_name || "—"
            : application.name || "—";


    $("#statusUID").textContent =
        application.submission_type === "gvg"
            ? application.leader_uid || "—"
            : application.uid || "—";


    $("#statusServer").textContent =
        application.server || "—";


    $("#statusDate").textContent =
        application.created_at
            ? new Date(application.created_at)
                .toLocaleString()
            : "—";


    const messages = {

        pending:
            "Your application has been received and is waiting for review.",

        seen:
            "Your application has been seen by the PLG team and is currently being reviewed.",

        approved:
            "Congratulations! Your application has been approved by PLG Gang.",

        rejected:
            "Your application was rejected. You may contact the PLG team for further information."

    };


    $("#statusMessage").textContent =
        messages[status] ||
        "Your application status has been updated.";
}


/* ================= MODAL ================= */

function setupModal() {

    $("#closeModal").addEventListener(
        "click",
        closeSuccessModal
    );


    $("#successModal").addEventListener(
        "click",
        event => {

            if (
                event.target.id === "successModal"
            ) {
                closeSuccessModal();
            }

        }
    );


    $("#copyTracking").addEventListener(
        "click",
        async () => {

            const code =
                $("#trackingCode").textContent.trim();

            try {

                await navigator.clipboard.writeText(code);

                showToast("Tracking code copied.");

            } catch {

                showToast("Copy failed.");

            }

        }
    );


    $("#viewStatusBtn").addEventListener(
        "click",
        () => {

            const code =
                $("#trackingCode").textContent.trim();

            closeSuccessModal();

            $("#trackingInput").value = code;

            showSection("status");

            setTimeout(() => {
                $("#checkStatusBtn").click();
            }, 350);

        }
    );

}


/* ================= SECRET ADMIN ================= */

function setupSecretAdmin() {

    const logo = $("#secretLogo");

    let clicks = 0;
    let timer = null;


    logo.addEventListener("click", () => {

        clicks++;


        clearTimeout(timer);


        timer = setTimeout(() => {
            clicks = 0;
        }, 1000);


        if (clicks >= 5) {

            clicks = 0;

            window.location.href = "admin.html";
        }

    });

}


/* ================= YEAR ================= */

function setupYear() {

    const year = $("#currentYear");

    if (year) {
        year.textContent =
            new Date().getFullYear();
    }

}


/* ================= INIT ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();
        setupServerFields();

        setupGuildTestForm();
        setupGVGForm();

        setupStatus();
        setupModal();

        setupSecretAdmin();
        setupYear();

    }
);