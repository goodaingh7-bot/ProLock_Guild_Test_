const SUPABASE_URL =
    "https://zqpvpqtdrnntoqorwumk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_NL3BBWY2j59f7gjXrkzzzw_YtoWgLcs";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


let applications = [];
let currentFilter = "all";


const $ = selector =>
    document.querySelector(selector);


/* ================= LOGIN ================= */

async function checkSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (session) {

        $("#loginScreen").classList.add("hidden");
        $("#adminApp").classList.remove("hidden");

        await loadApplications();

    } else {

        $("#loginScreen").classList.remove("hidden");
        $("#adminApp").classList.add("hidden");

    }

}


/* ================= LOGIN FORM ================= */

$("#loginForm").addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            $("#adminEmail").value.trim();

        const password =
            $("#adminPassword").value;


        $("#loginMessage").textContent =
            "Signing in...";


        const { error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });


        if (error) {

            console.error(error);

            $("#loginMessage").textContent =
                "Invalid email or password.";

            return;
        }


        $("#loginMessage").textContent = "";

        await checkSession();

    }
);


/* ================= LOGOUT ================= */

$("#logoutBtn").addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        location.reload();

    }
);


/* ================= LOAD ================= */

async function loadApplications() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        location.reload();

        return;
    }


    const { data: admin } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();


    if (!admin) {

        await supabaseClient.auth.signOut();

        alert("You are not an authorized admin.");

        location.reload();

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("submissions")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        return;
    }


    applications = data || [];

    updateStats();

    renderApplications();

}


/* ================= STATS ================= */

function updateStats() {

    $("#totalCount").textContent =
        applications.length;

    $("#pendingCount").textContent =
        applications.filter(
            item => item.status === "pending"
        ).length;

    $("#approvedCount").textContent =
        applications.filter(
            item => item.status === "approved"
        ).length;

    $("#rejectedCount").textContent =
        applications.filter(
            item => item.status === "rejected"
        ).length;

}


/* ================= RENDER ================= */

function renderApplications() {

    const container =
        $("#applications");


    let filtered =
        applications;


    if (currentFilter !== "all") {

        filtered =
            applications.filter(
                item =>
                    item.status === currentFilter
            );

    }


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-admin">
                No applications found.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered.map(createApplicationHTML).join("");


    attachApplicationActions();

}


/* ================= CARD ================= */

function createApplicationHTML(item) {

    const isGVG =
        item.submission_type === "gvg";


    const title =
        isGVG
            ? item.guild_name || "GVG Application"
            : item.name || "Guild Test";


    const type =
        isGVG
            ? "GVG CHALLENGE"
            : "GUILD TEST";


    const name =
        isGVG
            ? item.leader_name || "—"
            : item.name || "—";


    const uid =
        isGVG
            ? item.leader_uid || "—"
            : item.uid || "—";


    const extra =
        isGVG
            ? "Leader"
            : item.test_type || "—";


    const date =
        item.created_at
            ? new Date(
                item.created_at
            ).toLocaleString()
            : "—";


    return `
        <article
            class="application"
            data-id="${item.id}"
        >

            <div class="application-top">

                <div>

                    <div class="application-type">
                        ${type}
                    </div>

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                </div>

                <div class="badge ${item.status}">
                    ${String(item.status).toUpperCase()}
                </div>

            </div>


            <div class="application-details">

                <div class="detail">
                    <span>NAME</span>
                    <strong>${escapeHTML(name)}</strong>
                </div>

                <div class="detail">
                    <span>UID</span>
                    <strong>${escapeHTML(uid)}</strong>
                </div>

                <div class="detail">
                    <span>SERVER</span>
                    <strong>${escapeHTML(item.server || "—")}</strong>
                </div>

                <div class="detail">
                    <span>TYPE / ROLE</span>
                    <strong>${escapeHTML(extra)}</strong>
                </div>

                <div class="detail">
                    <span>TRACKING CODE</span>
                    <strong>${escapeHTML(item.tracking_code || "—")}</strong>
                </div>

                <div class="detail">
                    <span>SUBMITTED</span>
                    <strong>${escapeHTML(date)}</strong>
                </div>

                ${
                    isGVG
                    ? `
                    <div class="detail">
                        <span>GUILD</span>
                        <strong>${escapeHTML(item.guild_name || "—")}</strong>
                    </div>
                    `
                    : ""
                }

            </div>


            <div class="application-actions">

                <button
                    class="copy-btn"
                    data-action="copy"
                    data-value="${escapeAttr(uid)}"
                >
                    Copy UID
                </button>

                <button
                    class="copy-btn"
                    data-action="copy"
                    data-value="${escapeAttr(name)}"
                >
                    Copy Name
                </button>

                <button
                    class="copy-btn"
                    data-action="copy"
                    data-value="${escapeAttr(item.tracking_code || "")}"
                >
                    Copy Code
                </button>

                <button
                    class="seen-btn"
                    data-action="status"
                    data-status="seen"
                >
                    Seen
                </button>

                <button
                    class="approve-btn"
                    data-action="status"
                    data-status="approved"
                >
                    Approve
                </button>

                <button
                    class="reject-btn"
                    data-action="status"
                    data-status="rejected"
                >
                    Reject
                </button>

            </div>

        </article>
    `;
}


/* ================= ACTIONS ================= */

function attachApplicationActions() {

    document
        .querySelectorAll(".application-actions button")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const card =
                        button.closest(".application");

                    const id =
                        card.dataset.id;


                    const action =
                        button.dataset.action;


                    if (action === "copy") {

                        await navigator.clipboard.writeText(
                            button.dataset.value
                        );

                        button.textContent =
                            "Copied ✓";

                        setTimeout(() => {

                            button.textContent =
                                button.dataset.value.length > 20
                                    ? "Copy Code"
                                    : "Copied";

                        }, 1200);

                        return;
                    }


                    if (action === "status") {

                        await changeStatus(
                            id,
                            button.dataset.status
                        );

                    }

                }
            );

        });

}


/* ================= UPDATE STATUS ================= */

async function changeStatus(
    id,
    status
) {

    const {
        error
    } = await supabaseClient
        .from("submissions")
        .update({
            status: status
        })
        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Status update failed."
        );

        return;
    }


    await loadApplications();

}


/* ================= FILTER ================= */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                currentFilter =
                    button.dataset.filter;


                renderApplications();

            }
        );

    });


/* ================= REFRESH ================= */

$("#refreshBtn").addEventListener(
    "click",
    async () => {

        $("#refreshBtn").textContent =
            "Refreshing...";

        await loadApplications();

        $("#refreshBtn").textContent =
            "↻ Refresh";

    }
);


/* ================= SECURITY HELPERS ================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttr(value) {

    return escapeHTML(value);
}


/* ================= INIT ================= */

checkSession();