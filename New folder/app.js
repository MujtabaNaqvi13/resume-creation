const STORAGE_KEY = 'resume-builder-state-v1';
const DEFAULT_STATE = {
  currentStep: 1,
  name: '',
  phone: '',
  email: '',
  age: '',
  targetRole: '',
  targetCompany: '',
  jobDescription: '',
  workHistory: [],
  skills: [],
  education: {
    degree: '',
    school: '',
    graduationYear: '',
    certifications: [],
    schoolName: '',
    currentGrade: '',
    favoriteSubjects: []
  },
  style: 'strict',
  neverWorked: false,
  layout: 'single-page',
  typography: 'sans-serif-modern',
  preset: ''
};

// Theme initialization
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

function initTheme() {
  const savedTheme = localStorage.getItem('resume-theme') || 'light';
  htmlElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('resume-theme', newTheme);
  updateThemeIcon(newTheme);
}

themeToggle.addEventListener('click', toggleTheme);
initTheme();

const steps = Array.from(document.querySelectorAll('.step'));
const workHistoryContainer = document.getElementById('workHistoryContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const generateBtn = document.getElementById('generateBtn');
const outputSection = document.getElementById('outputSection');
const outputPreview = document.getElementById('outputPreview');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const downloadTxtBtn = document.getElementById('downloadTxtBtn');
const copyOutput = document.getElementById('copyOutput');
const sendEmailBtn = document.getElementById('sendEmailBtn');
const wizardForm = document.getElementById('wizardForm');
const formFeedback = document.getElementById('formFeedback');
const emailMessage = document.getElementById('emailMessage');

let state = { ...DEFAULT_STATE, education: { ...DEFAULT_STATE.education } };
let isEmailSending = false;
let previewGenerated = false;

function updateStepDisplay() {
  steps.forEach((step, index) => {
    step.classList.toggle('hidden', index + 1 !== state.currentStep);
  });

  const isLastStep = state.currentStep === steps.length;
  prevBtn.classList.toggle('hidden', state.currentStep === 1);
  nextBtn.classList.toggle('hidden', isLastStep);
  generateBtn.classList.toggle('hidden', !isLastStep);
  setFormFeedback('');
}

function isYouthProfile() {
  const ageValue = Number.parseInt(state.age, 10);
  return Number.isFinite(ageValue) && ageValue <= 15;
}

function updateExperienceUi() {
  const heading = document.getElementById('experienceHeading');
  const intro = document.getElementById('experienceIntro');
  const neverWorkedWrapper = document.getElementById('neverWorkedWrapper');
  const addJobBtn = document.getElementById('addJob');

  if (isYouthProfile()) {
    heading.textContent = 'Step 2: Activities & Projects';
    intro.textContent = 'Add volunteer work, school projects, or extracurricular activities that showcase initiative.';
    neverWorkedWrapper.classList.remove('hidden');
    addJobBtn.classList.toggle('hidden', state.neverWorked);
  } else {
    heading.textContent = 'Step 2: Professional Work History';
    intro.textContent = 'Add the roles that best support this application.';
    neverWorkedWrapper.classList.add('hidden');
    addJobBtn.classList.remove('hidden');
  }
}

function updateEducationUi() {
  const olderBlock = document.getElementById('educationOlder');
  const youngerBlock = document.getElementById('educationYounger');
  const heading = document.getElementById('educationHeading');
  if (isYouthProfile()) {
    olderBlock.classList.add('hidden');
    youngerBlock.classList.remove('hidden');
    heading.textContent = 'Step 4: Education & Interests';
  } else {
    olderBlock.classList.remove('hidden');
    youngerBlock.classList.add('hidden');
    heading.textContent = 'Step 4: Education & Credentials';
  }
}

function setFormFeedback(message, isError = false) {
  formFeedback.textContent = message;
  formFeedback.style.color = isError ? '#b91c1c' : '#475569';
}

function setEmailFeedback(message, isError = false) {
  emailMessage.textContent = message;
  emailMessage.classList.toggle('error', isError);
}

function createWorkEntry(index, entry = {}) {
  const workDiv = document.createElement('div');
  workDiv.className = 'work-entry';
  workDiv.dataset.index = index;
  const isYouth = isYouthProfile();
  workDiv.innerHTML = `
    <h3>${isYouth ? 'Activity' : 'Role'} ${index + 1}</h3>
    <label>
      ${isYouth ? 'Activity title' : 'Job title'}
      <input type="text" class="experience-title" value="${entry.title || ''}" placeholder="${isYouth ? 'e.g. Community Garden Lead' : 'e.g. Senior Product Manager'}" required />
    </label>
    <label>
      ${isYouth ? 'School / Organization' : 'Company'}
      <input type="text" class="experience-organization" value="${entry.organization || entry.company || ''}" placeholder="${isYouth ? 'e.g. Lincoln High School' : 'e.g. Global Tech'}" required />
    </label>
    <label>
      Dates
      <input type="text" class="experience-dates" value="${entry.dates || ''}" placeholder="e.g. 2021 - Present" required />
    </label>
    <label>
      ${isYouth ? 'What you did and what you learned' : 'Responsibilities / achievements (one per line)'}
      <textarea class="experience-bullets" rows="5" placeholder="${isYouth ? 'Describe your contribution and results' : 'Enter 2-3 bullet points'}">${(entry.bullets || []).join('\n')}</textarea>
    </label>
    <button type="button" class="remove-job">Remove entry</button>
  `;

  workDiv.querySelector('.remove-job').addEventListener('click', () => {
    removeWorkEntry(index);
  });

  return workDiv;
}

function renderWorkHistory() {
  workHistoryContainer.innerHTML = '';

  if (state.neverWorked && isYouthProfile()) {
    workHistoryContainer.innerHTML = '<p class="helper-text">No formal job history yet. We will highlight school projects, volunteering, and activities instead.</p>';
    return;
  }

  if (!state.workHistory.length) {
    workHistoryContainer.innerHTML = '<p class="helper-text">Add one activity or work experience entry to continue.</p>';
    return;
  }

  state.workHistory.forEach((entry, index) => {
    workHistoryContainer.appendChild(createWorkEntry(index, entry));
  });
}

function addWorkEntry() {
  if (state.neverWorked && isYouthProfile()) {
    return;
  }

  state.workHistory.push({ title: '', organization: '', dates: '', bullets: [] });
  renderWorkHistory();
  persistState();
}

function removeWorkEntry(index) {
  state.workHistory.splice(index, 1);
  renderWorkHistory();
  persistState();
}

function syncWorkHistoryFromUI() {
  const entries = Array.from(workHistoryContainer.querySelectorAll('.work-entry'));
  state.workHistory = entries.map((entryNode) => ({
    title: entryNode.querySelector('.experience-title').value.trim(),
    organization: entryNode.querySelector('.experience-organization').value.trim(),
    dates: entryNode.querySelector('.experience-dates').value.trim(),
    bullets: entryNode.querySelector('.experience-bullets').value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }));
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function syncStateFromDom() {
  state.name = document.getElementById('fullName').value.trim();
  state.phone = document.getElementById('phoneNumber').value.trim();
  state.email = document.getElementById('emailAddress').value.trim();
  state.age = document.getElementById('age').value.trim();
  state.targetRole = document.getElementById('targetRole').value.trim();
  state.targetCompany = document.getElementById('targetCompany').value.trim();
  state.jobDescription = document.getElementById('jobDescription').value.trim();
  syncWorkHistoryFromUI();
  state.skills = document.getElementById('skills').value.split(',').map((item) => item.trim()).filter(Boolean);
  state.education.degree = document.getElementById('degree').value.trim();
  state.education.school = document.getElementById('school').value.trim();
  state.education.graduationYear = document.getElementById('graduationYear').value.trim();
  state.education.certifications = document.getElementById('certifications').value.split(',').map((item) => item.trim()).filter(Boolean);
  state.education.schoolName = document.getElementById('schoolName').value.trim();
  state.education.currentGrade = document.getElementById('currentGrade').value.trim();
  state.education.favoriteSubjects = document.getElementById('favoriteSubjects').value.split(',').map((item) => item.trim()).filter(Boolean);

  state.neverWorked = document.getElementById('neverWorked').checked;

  const selectedStyle = document.querySelector('input[name="style"]:checked');
  if (selectedStyle) {
    state.style = selectedStyle.value;
  }

  // Handle resume format selections
  const selectedLayout = document.querySelector('input[name="layout"]:checked');
  if (selectedLayout) {
    state.layout = selectedLayout.value;
  }

  const selectedTypography = document.querySelector('input[name="typography"]:checked');
  if (selectedTypography) {
    state.typography = selectedTypography.value;
  }

  const selectedPreset = document.querySelector('input[name="preset"]:checked');
  if (selectedPreset) {
    state.preset = selectedPreset.value;
    // Apply preset overrides
    applyPresetFormat(selectedPreset.value);
  }
}

function applyPresetFormat(preset) {
  const presets = {
    'ats-friendly': { layout: 'single-page', typography: 'sans-serif-professional' },
    'modern-creative': { layout: 'sidebar', typography: 'sans-serif-modern' },
    'corporate-executive': { layout: 'two-page', typography: 'serif-traditional' }
  };

  if (presets[preset]) {
    const { layout, typography } = presets[preset];
    state.layout = layout;
    state.typography = typography;
    
    // Update UI to reflect preset
    document.querySelectorAll('input[name="layout"]').forEach((radio) => {
      radio.checked = radio.value === layout;
    });
    document.querySelectorAll('input[name="typography"]').forEach((radio) => {
      radio.checked = radio.value === typography;
    });
  }
}

function populateFormFromState() {
  document.getElementById('fullName').value = state.name;
  document.getElementById('phoneNumber').value = state.phone;
  document.getElementById('emailAddress').value = state.email;
  document.getElementById('age').value = state.age;
  document.getElementById('targetRole').value = state.targetRole;
  document.getElementById('targetCompany').value = state.targetCompany;
  document.getElementById('jobDescription').value = state.jobDescription;
  document.getElementById('skills').value = state.skills.join(', ');
  document.getElementById('degree').value = state.education.degree;
  document.getElementById('school').value = state.education.school;
  document.getElementById('graduationYear').value = state.education.graduationYear;
  document.getElementById('certifications').value = state.education.certifications.join(', ');
  document.getElementById('schoolName').value = state.education.schoolName;
  document.getElementById('currentGrade').value = state.education.currentGrade;
  document.getElementById('favoriteSubjects').value = state.education.favoriteSubjects.join(', ');

  document.querySelectorAll('input[name="style"]').forEach((radio) => {
    radio.checked = radio.value === state.style;
  });

  document.querySelectorAll('input[name="layout"]').forEach((radio) => {
    radio.checked = radio.value === state.layout;
  });

  document.querySelectorAll('input[name="typography"]').forEach((radio) => {
    radio.checked = radio.value === state.typography;
  });

  if (state.preset) {
    document.querySelectorAll('input[name="preset"]').forEach((radio) => {
      radio.checked = radio.value === state.preset;
    });
  }

  document.getElementById('neverWorked').checked = Boolean(state.neverWorked);

  if (state.workHistory.length) {
    renderWorkHistory();
  } else {
    addWorkEntry();
  }
}

function restoreState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    state = {
      ...DEFAULT_STATE,
      ...parsed,
      education: {
        ...DEFAULT_STATE.education,
        ...(parsed.education || {})
      }
    };
    populateFormFromState();
    updateExperienceUi();
    updateEducationUi();
  } catch (error) {
    console.warn('Could not restore saved state.', error);
  }
}

function toSentenceCase(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatContact(value, fallback) {
  return value || fallback;
}

function normalizeDocument(text) {
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildDocumentText() {
  const templateSet = templates[state.style] || templates.strict;
  const resume = templateSet.resume(state);
  const coverLetter = templateSet.coverLetter(state);
  return normalizeDocument(`${resume}\n\n---\n\n${coverLetter}`);
}

const templates = {
  strict: {
    resume: (data) => {
      const isYouth = isYouthProfile();
      const summary = isYouth
        ? `Motivated student targeting ${data.targetRole} at ${data.targetCompany}, bringing curiosity, discipline, and strong participation in school and community-based initiatives.`
        : `Seasoned professional targeting ${data.targetRole} at ${data.targetCompany}, with a history of driving measurable results across strategic execution, stakeholder alignment, and operational improvement.`;
      const experience = data.workHistory.map((item) => {
        const bullets = item.bullets.map((line) => `• ${toSentenceCase(line)}`);
        return `${item.title} | ${item.organization || item.company}\n${item.dates}\n${bullets.join('\n')}`;
      }).join('\n\n');
      const competencies = data.skills.length ? data.skills.map((skill) => `• ${skill}`).join('\n') : '• N/A';
      const education = isYouth
        ? `• School: ${data.education.schoolName || '[School Name]'}\n• Grade: ${data.education.currentGrade || '[Current Grade]'}\n• Favorite subjects: ${data.education.favoriteSubjects.join(', ') || '[Favorite Subjects]'}`
        : `• ${data.education.degree}, ${data.education.school} (${data.education.graduationYear})${data.education.certifications.length ? '\n• Certifications: ' + data.education.certifications.join(', ') : ''}`;

      return `${formatContact(data.name, '[Your Name]')}\n${formatContact(data.phone, '[Phone Number]')} | ${formatContact(data.email, '[Email Address]')}\n\nProfessional Summary\n${summary}\n\n${isYouth ? 'Experience & Activities' : 'Professional Experience'}\n${experience}\n\nCore Competencies\n${competencies}\n\n${isYouth ? 'Education & Interests' : 'Education & Certifications'}\n${education}`;
    },
    coverLetter: (data) => {
      const opening = `Dear Hiring Manager,\n\nI am writing to express my interest in the ${data.targetRole} role at ${data.targetCompany}. With proven experience leading cross-functional initiatives and delivering results in fast-paced environments, I am confident I can contribute to your team immediately.`;
      const body = `In previous roles, I have consistently translated strategic objectives into measurable outcomes by optimizing processes, aligning stakeholders, and executing with discipline. I bring a strong track record of ownership, metrics-driven planning, and effective communication.`;
      const closing = `I welcome the opportunity to discuss how my experience aligns with ${data.targetCompany}'s priorities and how I can help advance your business goals. Thank you for your consideration.`;
      return `${opening}\n\n${body}\n\n${closing}\n\nSincerely,\n${formatContact(data.name, '[Your Name]')}`;
    }
  },
  modern: {
    resume: (data) => {
      const isYouth = isYouthProfile();
      const summary = isYouth
        ? `Curious and dependable student targeting ${data.targetRole} at ${data.targetCompany}, with growing experience in projects, teamwork, and community-focused work.`
        : `Results-driven ${data.targetRole} focused on delivering measurable impact for ${data.targetCompany}. Expert at using data, process design, and collaboration to accelerate outcomes.`;
      const expertise = data.skills.map((skill) => `• ${skill}`).join('\n');
      const experience = data.workHistory.map((item) => {
        const bullets = item.bullets.map((line) => `• ${line.charAt(0).match(/[0-9]/) ? line : 'Improved ' + line}`).join('\n');
        return `${item.title} — ${item.organization || item.company} | ${item.dates}\n${bullets}`;
      }).join('\n\n');
      const education = isYouth
        ? `• School: ${data.education.schoolName || '[School Name]'}\n• Grade: ${data.education.currentGrade || '[Current Grade]'}\n• Favorite subjects: ${data.education.favoriteSubjects.join(', ') || '[Favorite Subjects]'}`
        : `• ${data.education.degree}, ${data.education.school} (${data.education.graduationYear})`;
      const certifications = data.education.certifications.length ? `• ${data.education.certifications.join(', ')}` : '';
      return `${formatContact(data.name, '[Your Name]')}\n${formatContact(data.phone, '[Phone Number]')} | ${formatContact(data.email, '[Email Address]')}\n\nExecutive Summary\n${summary}\n\nKey Expertise\n${expertise}\n\n${isYouth ? 'Experience & Activities' : 'Professional Experience'}\n${experience}\n\n${isYouth ? 'Education & Interests' : 'Education & Tech Stack'}\n${education}${certifications ? '\n' + certifications : ''}`;
    },
    coverLetter: (data) => {
      const opening = `Hello ${data.targetCompany} team,\n\nI am excited to apply for the ${data.targetRole} position. I build systems that remove friction, improve performance, and support high-growth teams.`;
      const body = `I have delivered tangible improvements by focusing on outcomes, turning strategy into execution, and collaborating closely with product, design, and engineering partners. I am ready to help ${data.targetCompany} solve its next scaling challenge.`;
      const closing = `Thank you for reviewing my application. I look forward to sharing how my experience can directly support your goals.`;
      return `${opening}\n\n${body}\n\n${closing}\n\nBest regards,\n${formatContact(data.name, '[Your Name]')}`;
    }
  },
  bold: {
    resume: (data) => {
      const isYouth = isYouthProfile();
      const tagline = 'Driven by curiosity, purpose, and the confidence that strong storytelling moves ideas into action.';
      const journey = `I am pursuing the ${data.targetRole} role at ${data.targetCompany} because I thrive on shaping clear narratives from complex problems. I combine creative thinking, disciplined execution, and strong stakeholder partnerships to deliver work that resonates.`;
      const strengths = data.skills.map((skill) => `• ${skill}`).join('\n');
      const experience = data.workHistory.map((item) => {
        const bullets = item.bullets.map((line) => `• ${line}`).join('\n');
        return `${item.title} @ ${item.organization || item.company} | ${item.dates}\n${bullets}`;
      }).join('\n\n');
      const education = isYouth
        ? `• School: ${data.education.schoolName || '[School Name]'}\n• Grade: ${data.education.currentGrade || '[Current Grade]'}\n• Favorite subjects: ${data.education.favoriteSubjects.join(', ') || '[Favorite Subjects]'}`
        : `• ${data.education.degree}, ${data.education.school} (${data.education.graduationYear})`;
      const certifications = data.education.certifications.length ? `• ${data.education.certifications.join(', ')}` : '';
      return `${formatContact(data.name, '[Your Name]')}\n${formatContact(data.phone, '[Phone Number]')} | ${formatContact(data.email, '[Email Address]')}\n\n${tagline}\n\nMy Story\n${journey}\n\nCore Strengths & Tools\n${strengths}\n\n${isYouth ? 'Experience & Activities' : 'Professional Experience'}\n${experience}\n\n${isYouth ? 'Education & Interests' : 'Education & Continuous Learning'}\n${education}${certifications ? '\n' + certifications : ''}`;
    },
    coverLetter: (data) => {
      const opening = `Dear ${data.targetCompany} hiring team,\n\nWhen I first learned about the ${data.targetRole} opportunity, I pictured the kind of momentum your team can build with the right mix of creativity and structure. That belief is what drives my work.`;
      const body = `I thrive on creating clarity where things feel uncertain — translating ideas into stories, metrics, and action plans that stakeholders can rally behind. My experience spans launching new programs, redefining processes, and delivering outcomes with a distinct point of view.`;
      const closing = `I would love to connect and discuss how my perspective and energy can contribute to ${data.targetCompany}'s next phase. Thank you for considering my application.`;
      return `${opening}\n\n${body}\n\n${closing}\n\nWarmly,\n${formatContact(data.name, '[Your Name]')}`;
    }
  },
  executive: {
    resume: (data) => {
      const summary = `Executive-minded professional targeting ${data.targetRole} at ${data.targetCompany}. Known for strategic planning, polished communication, and strong leadership execution.`;
      const experience = data.workHistory.map((item) => {
        const bullets = item.bullets.map((line) => `• ${line}`).join('\n');
        return `${item.title} — ${item.organization || item.company}\n${item.dates}\n${bullets}`;
      }).join('\n\n');
      const competencies = data.skills.length ? data.skills.map((skill) => `• ${skill}`).join('\n') : '• N/A';
      const education = `• ${data.education.degree || '[Degree]'} • ${data.education.school || '[School]'} • ${data.education.graduationYear || '[Year]'}`;
      return `${formatContact(data.name, '[Your Name]')}\n${formatContact(data.phone, '[Phone Number]')} | ${formatContact(data.email, '[Email Address]')}\n\nExecutive Summary\n${summary}\n\nKey Experience\n${experience}\n\nCore Competencies\n${competencies}\n\nEducation\n${education}`;
    },
    coverLetter: (data) => {
      const opening = `Dear Hiring Manager,\n\nI am excited to apply for the ${data.targetRole} role at ${data.targetCompany}. My experience reflects a strong blend of strategic leadership, operational discipline, and polished stakeholder engagement.`;
      const body = `I am particularly drawn to the opportunity because it aligns with my strengths in delivering clarity, momentum, and measurable results. I would welcome the chance to discuss how I can support your organization.`;
      const closing = `Thank you for your time and consideration.`;
      return `${opening}\n\n${body}\n\n${closing}\n\nBest regards,\n${formatContact(data.name, '[Your Name]')}`;
    }
  }
};

function renderPreview() {
  outputPreview.textContent = buildDocumentText();
  outputSection.classList.remove('hidden');
  previewGenerated = true;
}

function downloadTextFile() {
  const content = outputPreview.textContent;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'resume-cover-letter.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadPdfFile() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const text = outputPreview.textContent || 'No content generated yet.';
  const lines = doc.splitTextToSize(text, 500);
  doc.text(lines, 40, 50);
  doc.save('resume-cover-letter.pdf');
}

function initializeEmailService() {
  const config = window.EMAILJS_CONFIG || {};
  if (window.emailjs && typeof window.emailjs.init === 'function') {
    if (config.publicKey && !config.publicKey.includes('YOUR_') && config.publicKey.trim() !== '') {
      window.emailjs.init(config.publicKey);
    }
  }
}

function isEmailJSConfigured() {
  const config = window.EMAILJS_CONFIG || {};
  const hasPublicKey = config.publicKey && !config.publicKey.includes('YOUR_') && config.publicKey.trim() !== '';
  const hasServiceId = config.serviceId && !config.serviceId.includes('YOUR_') && config.serviceId.trim() !== '';
  const hasTemplateId = config.templateId && !config.templateId.includes('YOUR_') && config.templateId.trim() !== '';
  
  return hasPublicKey && hasServiceId && hasTemplateId && window.emailjs && typeof window.emailjs.send === 'function';
}

async function sendDocumentByEmail() {
  const recipient = document.getElementById('emailToSend').value.trim();
  const content = outputPreview.textContent;

  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    setEmailFeedback('Please enter a valid email address.', true);
    return;
  }

  if (!content) {
    setEmailFeedback('Generate a document before sending it.', true);
    return;
  }

  if (isEmailSending) {
    return;
  }

  if (!isEmailJSConfigured()) {
    setEmailFeedback('⚠️ EmailJS is not configured. Visit index.html and add your EmailJS credentials (Public Key, Service ID, and Template ID) to enable email delivery.', true);
    return;
  }

  isEmailSending = true;
  sendEmailBtn.disabled = true;
  sendEmailBtn.textContent = 'Sending...';
  setEmailFeedback('Sending your document...');

  try {
    const config = window.EMAILJS_CONFIG;
    await window.emailjs.send(config.serviceId, config.templateId, {
      to_email: recipient,
      from_name: 'Resume Builder',
      subject: 'Your Resume & Cover Letter',
      message: content,
      reply_to: state.email || recipient,
      user_name: state.name || 'Applicant'
    });

    setEmailFeedback('Email sent successfully.');
  } catch (error) {
    console.error('Email sending failed', error);
    setEmailFeedback('Unable to send the email right now. Please try again later.', true);
  } finally {
    isEmailSending = false;
    sendEmailBtn.disabled = false;
    sendEmailBtn.textContent = 'Email to me';
  }
}

document.getElementById('addJob').addEventListener('click', () => {
  addWorkEntry();
  setFormFeedback('Added a new entry.');
});

wizardForm.addEventListener('input', () => {
  syncStateFromDom();
  persistState();
  updateExperienceUi();
  updateEducationUi();

  if (previewGenerated) {
    renderPreview();
  }
});

wizardForm.addEventListener('change', (event) => {
  if (event.target.matches('input[name="style"]')) {
    syncStateFromDom();
    persistState();
    if (previewGenerated) {
      renderPreview();
    }
  }
});

prevBtn.addEventListener('click', () => {
  if (state.currentStep > 1) {
    state.currentStep -= 1;
    updateStepDisplay();
  }
});

nextBtn.addEventListener('click', () => {
  syncStateFromDom();
  if (!validateCurrentStep()) {
    setFormFeedback('Please complete all required fields for this step.', true);
    return;
  }

  if (state.currentStep < steps.length) {
    state.currentStep += 1;
    updateStepDisplay();
  }
});

wizardForm.addEventListener('submit', (event) => {
  event.preventDefault();
  syncStateFromDom();
  if (!validateCurrentStep()) {
    setFormFeedback('Please complete all required fields before generating.', true);
    return;
  }

  renderPreview();
  outputPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setFormFeedback('Your document is ready. You can download it as PDF or TXT, or send it by email.');
});

downloadPdfBtn.addEventListener('click', () => {
  if (!outputPreview.textContent.trim()) {
    setEmailFeedback('Generate a document before downloading it.', true);
    return;
  }
  downloadPdfFile();
});

downloadTxtBtn.addEventListener('click', () => {
  if (!outputPreview.textContent.trim()) {
    setEmailFeedback('Generate a document before downloading it.', true);
    return;
  }
  downloadTextFile();
});

copyOutput.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outputPreview.textContent);
    copyOutput.textContent = 'Copied!';
    setTimeout(() => {
      copyOutput.textContent = 'Copy';
    }, 1600);
  } catch (error) {
    setEmailFeedback('Unable to copy automatically. Please select and copy manually.', true);
  }
});

sendEmailBtn.addEventListener('click', sendDocumentByEmail);

function validateCurrentStep() {
  if (state.currentStep === 1) {
    const emailValue = document.getElementById('emailAddress').value.trim();
    const hasRequiredFields = document.getElementById('fullName').value.trim() && document.getElementById('phoneNumber').value.trim() && emailValue && document.getElementById('age').value.trim() && document.getElementById('targetRole').value.trim() && document.getElementById('targetCompany').value.trim();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    return hasRequiredFields && isEmailValid;
  }

  if (state.currentStep === 2) {
    syncWorkHistoryFromUI();
    if (state.neverWorked && isYouthProfile()) {
      return true;
    }
    return state.workHistory.length > 0 && state.workHistory.every((entry) => entry.title && entry.organization && entry.dates && entry.bullets.length > 0);
  }

  if (state.currentStep === 3) {
    return document.getElementById('skills').value.trim();
  }

  if (state.currentStep === 4) {
    if (isYouthProfile()) {
      return document.getElementById('schoolName').value.trim() && document.getElementById('currentGrade').value.trim() && document.getElementById('favoriteSubjects').value.trim();
    }
    return document.getElementById('degree').value.trim() && document.getElementById('school').value.trim() && document.getElementById('graduationYear').value.trim();
  }

  if (state.currentStep === 5) {
    return !!document.querySelector('input[name="style"]:checked');
  }

  return true;
}

window.addEventListener('load', () => {
  initializeEmailService();
  restoreState();
  updateExperienceUi();
  updateEducationUi();
  updateStepDisplay();
  if (!state.workHistory.length) {
    addWorkEntry();
  }
});
