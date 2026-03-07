const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const issueContainer = document.getElementById("issue-container"); // HTML-এ কার্ড দেখানোর জায়গা
const issueCount = document.getElementById("issue-count"); // ইস্যুর সংখ্যা দেখানোর জায়গা

// --- ১. ডেটা নিয়ে আসার ফাংশন ---
async function fetchData(url) {
    // ডেটা লোড হওয়ার সময় একটি স্পিনার দেখাবে
    issueContainer.innerHTML = `<span class="loading loading-spinner text-indigo-600"></span>`;
    const response = await fetch(url);
    const result = await response.json();
    renderIssues(result.data); // ডেটা পাওয়ার পর তা রেন্ডার করবে
}

// --- ২. কার্ড রেন্ডারিং ফাংশন (Figma অনুযায়ী ডিজাইন) ---
function renderIssues(issues) {
    issueContainer.innerHTML = ""; // আগের কার্ডগুলো মুছে ফেলা
    issueCount.innerText = `${issues.length} Issues`; // মোট ইস্যু সংখ্যা আপডেট করা

    issues.forEach(issue => {
        // স্ট্যাটাস চেক করা (Open নাকি Closed)
        const isClosed = issue.status === "closed";
        const borderColor = isClosed ? "border-t-purple-500" : "border-t-emerald-500";
    
        // নতুন কার্ড তৈরি করা
        const card = document.createElement("div");
        card.className = `card bg-white border border-gray-200 ${borderColor} border-t-4 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-lg transition`;
        card.onclick = () => showModal(issue.id); // ক্লিক করলে মোডাল দেখাবে
    
        // কার্ডের ভেতর কন্টেন্ট সেট করা
        card.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <i class="fa-solid ${isClosed ? 'fa-check-circle text-purple-500' : 'fa-circle-notch text-emerald-500'}"></i>
                <span class="badge ${issue.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'} text-[9px] font-bold">${issue.priority.toUpperCase()}</span>
            </div>
            <h3 class="font-bold text-sm leading-tight">${issue.title}</h3>
            <p class="text-xs text-gray-500 mt-2 line-clamp-2">${issue.description}</p>
            
            <div class="flex flex-wrap gap-1 mt-3 mb-3">
                <span class="badge bg-red-100 text-red-600 text-[9px] font-bold border-none px-2">BUG</span>
                <span class="badge bg-yellow-100 text-yellow-700 text-[9px] font-bold border-none px-2">HELP WANTED</span>
            </div>

            <div class="text-[10px] text-gray-400 border-t pt-2">
                #${issue.id} by ${issue.author} | ${new Date(issue.createdAt).toLocaleDateString()}
            </div>
        `;
        issueContainer.appendChild(card);
    });
}

// --- ৩. ডাইনামিক মোডাল ফাংশন ---
async function showModal(id) {
    // নির্দিষ্ট ইস্যুর বিস্তারিত ডেটা আনা
    const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const result = await response.json();
    const issue = result.data;

    const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-GB');

    // মোডাল শিরোনাম ও বর্ণনা সেট করা
    document.getElementById('modal-title').innerText = issue.title;
    document.getElementById('modal-desc').innerHTML = `
        <div class="flex items-center gap-2 mb-4">
            <span class="badge ${issue.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'} font-bold">${issue.status.toUpperCase()}</span>
            <span class="text-xs text-gray-500">Opened by ${issue.author} • ${formattedDate}</span>
        </div>
        
        <div class="flex gap-2 mb-6">
            <span class="badge bg-red-100 text-red-600 font-bold border-none px-3">BUG</span>
            <span class="badge bg-yellow-100 text-yellow-700 font-bold border-none px-3">HELP WANTED</span>
        </div>

        <p class="text-sm text-gray-600 leading-relaxed mb-6">${issue.description}</p>
        
        <div class="bg-gray-50 p-4 rounded-lg flex justify-between items-center border">
            <div>
                <p class="text-[10px] uppercase text-gray-400">Assignee</p>
                <p class="text-sm font-bold">${issue.assignee || 'Unassigned'}</p>
            </div>
            <div>
                <p class="text-[10px] uppercase text-gray-400">Priority</p>
                <span class="badge bg-red-500 text-white font-bold px-4">${issue.priority.toUpperCase()}</span>
            </div>
        </div>
    `;
    
    document.getElementById('issue_modal').showModal(); // মোডালটি প্রদর্শন করা
}

// --- ৪. ট্যাব ফিল্টারিং ফাংশন ---
async function handleFilter(status, btnElement) {
    // ট্যাব স্টাইল রিসেট ও একটিভ করা
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active', 'bg-blue-700', 'text-white'));
    btnElement.classList.add('tab-active', 'bg-blue-700', 'text-white');
    
    const response = await fetch(API_BASE);
    const result = await response.json();
    
    // স্ট্যাটাস অনুযায়ী ডেটা ফিল্টার করা
    if (status === 'all') {
        renderIssues(result.data);
    } else {
        const filteredData = result.data.filter(item => item.status === status);
        renderIssues(filteredData);
    }
}

// --- ৫. সার্চ ফাংশন ---
document.getElementById('search-btn').onclick = async () => {
    const searchText = document.getElementById('search-input').value;
    const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`);
    const result = await response.json();
    renderIssues(result.data); // সার্চ রেজাল্ট কার্ডে দেখানো
};

// অ্যাপ শুরু করার সময় প্রাথমিক ডেটা লোড করা
fetchData(API_BASE);