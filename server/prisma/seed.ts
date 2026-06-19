import { PrismaClient, Role, TicketPriority, TicketStatus, TicketCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hashSync(pw, 12);

const users = [
  { email: 'admin@copilot.dev', password: hash('password123'), firstName: 'Alex', lastName: 'Morgan', role: Role.ADMIN, department: 'Engineering' },
  { email: 'agent1@copilot.dev', password: hash('password123'), firstName: 'Sarah', lastName: 'Chen', role: Role.AGENT, department: 'IT Support' },
  { email: 'agent2@copilot.dev', password: hash('password123'), firstName: 'Marcus', lastName: 'Johnson', role: Role.AGENT, department: 'IT Support' },
  { email: 'agent3@copilot.dev', password: hash('password123'), firstName: 'Priya', lastName: 'Patel', role: Role.AGENT, department: 'HR Support' },
  { email: 'agent4@copilot.dev', password: hash('password123'), firstName: 'David', lastName: 'Kim', role: Role.AGENT, department: 'Facilities' },
  { email: 'emp1@copilot.dev', password: hash('password123'), firstName: 'James', lastName: 'Wilson', role: Role.EMPLOYEE, department: 'Marketing' },
  { email: 'emp2@copilot.dev', password: hash('password123'), firstName: 'Emily', lastName: 'Davis', role: Role.EMPLOYEE, department: 'Sales' },
  { email: 'emp3@copilot.dev', password: hash('password123'), firstName: 'Michael', lastName: 'Brown', role: Role.EMPLOYEE, department: 'Finance' },
  { email: 'emp4@copilot.dev', password: hash('password123'), firstName: 'Lisa', lastName: 'Taylor', role: Role.EMPLOYEE, department: 'Engineering' },
  { email: 'emp5@copilot.dev', password: hash('password123'), firstName: 'Robert', lastName: 'Martinez', role: Role.EMPLOYEE, department: 'Operations' },
];

const categories = Object.values(TicketCategory);
const priorities = Object.values(TicketPriority);
const statuses = Object.values(TicketStatus);
const sentiments = ['positive', 'neutral', 'negative', 'frustrated'];

const ticketTemplates = [
  { title: 'Cannot access VPN from home', desc: 'I am unable to connect to the company VPN when working from home. I keep getting a timeout error.', cat: 'IT' },
  { title: 'Payroll discrepancy for last month', desc: 'My paycheck for last month seems to be missing overtime hours. I worked 12 extra hours that were not reflected.', cat: 'PAYROLL' },
  { title: 'Office AC not working on 3rd floor', desc: 'The air conditioning on the 3rd floor has been broken for two days. It is extremely uncomfortable.', cat: 'FACILITIES' },
  { title: 'Need access to Jira project board', desc: 'I recently joined the Alpha team and need access to their Jira project board for sprint planning.', cat: 'IT' },
  { title: 'Request for ergonomic chair', desc: 'I have been experiencing back pain and would like to request an ergonomic chair for my workstation.', cat: 'HR' },
  { title: 'Email not syncing on mobile', desc: 'My work email stopped syncing on my mobile device after the latest update. I have tried reinstalling the app.', cat: 'IT' },
  { title: 'Badge access to server room needed', desc: 'I need badge access to the server room for maintenance work scheduled next week.', cat: 'SECURITY' },
  { title: 'Printer on 2nd floor is jammed', desc: 'The main printer on the 2nd floor keeps jamming. Multiple people have reported this issue today.', cat: 'FACILITIES' },
  { title: 'PTO balance incorrect', desc: 'My PTO balance shows 5 days but I should have 12 remaining days. Please correct this.', cat: 'HR' },
  { title: 'Software license expired for Adobe', desc: 'My Adobe Creative Suite license has expired. I need it renewed ASAP for the marketing campaign.', cat: 'IT' },
  { title: 'Onboarding documents missing', desc: 'I started two weeks ago but still have not received my onboarding documents and employee handbook.', cat: 'HR' },
  { title: 'Conference room booking system down', desc: 'The conference room booking system has been down since yesterday morning. We cannot schedule meetings.', cat: 'IT' },
  { title: 'Suspicious email received', desc: 'I received a suspicious email asking for my credentials. It looks like a phishing attempt from an external sender.', cat: 'SECURITY' },
  { title: 'Laptop running extremely slow', desc: 'My company laptop has been running very slowly for the past week. Applications take minutes to open.', cat: 'IT' },
  { title: 'Expense report not processing', desc: 'I submitted my expense report two weeks ago but it still shows as pending. I need reimbursement.', cat: 'PAYROLL' },
  { title: 'Office lights flickering in wing B', desc: 'The lights in wing B have been flickering intermittently. This is causing headaches for several employees.', cat: 'FACILITIES' },
  { title: 'Cannot access shared drive', desc: 'I am unable to access the shared network drive. Getting permission denied error for the marketing folder.', cat: 'IT' },
  { title: 'Need new monitor for dual setup', desc: 'My second monitor stopped working and I need a replacement for my dual monitor setup.', cat: 'IT' },
  { title: 'Benefits enrollment deadline question', desc: 'I have questions about the open enrollment period for health benefits. When is the deadline?', cat: 'HR' },
  { title: 'Parking garage gate malfunction', desc: 'The parking garage gate on level 2 is not opening with employee badges. Several cars are stuck.', cat: 'FACILITIES' },
  { title: 'Data backup failed overnight', desc: 'The automated backup job failed last night. We need to investigate and run a manual backup immediately.', cat: 'OPERATIONS' },
  { title: 'New employee setup request', desc: 'We have a new hire starting Monday. Need laptop, email, badge, and system access configured.', cat: 'IT' },
  { title: 'Fire alarm testing schedule', desc: 'When is the next fire alarm testing? We need to notify the team for the upcoming drill.', cat: 'SECURITY' },
  { title: 'Internet connection dropping', desc: 'The internet connection keeps dropping every 30 minutes on the 4th floor. Affecting productivity severely.', cat: 'IT' },
  { title: 'Tax forms W-2 not received', desc: 'I have not received my W-2 form yet. Tax filing deadline is approaching and I need it urgently.', cat: 'PAYROLL' },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ticketEmbedding.deleteMany();
  await prisma.knowledgeChunk.deleteMany();
  await prisma.knowledgeDocument.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const createdUsers = await Promise.all(users.map(u => prisma.user.create({ data: u })));
  console.log(`✅ Created ${createdUsers.length} users`);

  const admins = createdUsers.filter(u => u.role === 'ADMIN');
  const agents = createdUsers.filter(u => u.role === 'AGENT');
  const employees = createdUsers.filter(u => u.role === 'EMPLOYEE');

  // Create tickets
  const ticketData = [];
  for (let i = 0; i < 150; i++) {
    const tmpl = ticketTemplates[i % ticketTemplates.length];
    const status = i < 50 ? pick(['RESOLVED', 'CLOSED'] as const) : pick(statuses);
    const priority = pick(priorities);
    const created = new Date(Date.now() - rand(0, 60) * 24 * 60 * 60 * 1000);
    const slaHours = priority === 'CRITICAL' ? 4 : priority === 'HIGH' ? 8 : priority === 'MEDIUM' ? 24 : 72;

    ticketData.push({
      title: i < ticketTemplates.length ? tmpl.title : `${tmpl.title} #${Math.floor(i / ticketTemplates.length) + 1}`,
      description: tmpl.desc,
      category: tmpl.cat as TicketCategory,
      priority,
      status: status as TicketStatus,
      sentiment: pick(sentiments),
      urgencyScore: rand(1, 10),
      aiConfidence: Math.random() * 0.4 + 0.6,
      slaDeadline: new Date(created.getTime() + slaHours * 3600000),
      creatorId: pick(employees).id,
      assignedAgentId: Math.random() > 0.2 ? pick(agents).id : null,
      resolvedAt: ['RESOLVED', 'CLOSED'].includes(status) ? new Date(created.getTime() + rand(1, 48) * 3600000) : null,
      resolution: ['RESOLVED', 'CLOSED'].includes(status) ? 'Issue has been resolved. Applied fix and verified with the user.' : null,
      createdAt: created,
      updatedAt: new Date(created.getTime() + rand(0, 24) * 3600000),
    });
  }

  const createdTickets = [];
  for (const t of ticketData) {
    createdTickets.push(await prisma.ticket.create({ data: t }));
  }
  console.log(`✅ Created ${createdTickets.length} tickets`);

  // Create comments
  const commentTexts = [
    'I am looking into this issue now. Will update shortly.',
    'Can you provide more details about when this started happening?',
    'I have escalated this to the senior team for review.',
    'This has been resolved. Please verify on your end.',
    'Thank you for reporting this. We are aware of the issue.',
    'I have applied a temporary fix. A permanent solution is in progress.',
    'Could you try clearing your cache and restarting?',
    'This appears to be related to the recent system update.',
    'I have assigned a specialist to handle this case.',
    'The issue has been identified. Deploying fix now.',
  ];

  let commentCount = 0;
  for (const ticket of createdTickets.slice(0, 100)) {
    const numComments = rand(1, 4);
    for (let j = 0; j < numComments; j++) {
      await prisma.comment.create({
        data: {
          content: pick(commentTexts),
          ticketId: ticket.id,
          authorId: Math.random() > 0.5 ? pick(agents).id : ticket.creatorId,
          isAIGenerated: Math.random() > 0.8,
          createdAt: new Date(ticket.createdAt.getTime() + (j + 1) * 3600000),
        },
      });
      commentCount++;
    }
  }
  console.log(`✅ Created ${commentCount} comments`);

  // Create notifications
  let notifCount = 0;
  for (const user of createdUsers) {
    const n = rand(2, 8);
    for (let j = 0; j < n; j++) {
      await prisma.notification.create({
        data: {
          type: pick(['TICKET_ASSIGNED', 'STATUS_CHANGE', 'NEW_COMMENT', 'AI_RECOMMENDATION', 'SLA_WARNING'] as const),
          title: pick(['New ticket assigned', 'Status updated', 'New comment', 'AI suggestion available', 'SLA warning']),
          message: pick(['A ticket has been assigned to you', 'Ticket status changed', 'Someone commented on your ticket', 'AI has a recommendation', 'SLA deadline approaching']),
          userId: user.id,
          read: Math.random() > 0.5,
          createdAt: new Date(Date.now() - rand(0, 14) * 24 * 3600000),
        },
      });
      notifCount++;
    }
  }
  console.log(`✅ Created ${notifCount} notifications`);

  // Create knowledge documents
  const kbDocs = [
    { title: 'VPN Setup Guide', desc: 'Step-by-step guide for setting up and troubleshooting VPN connections.', content: 'VPN Setup Guide\n\nStep 1: Download the VPN client from the IT portal.\nStep 2: Install the client and restart your computer.\nStep 3: Open the VPN client and enter your credentials.\nStep 4: Select the appropriate server location.\nStep 5: Click connect.\n\nTroubleshooting:\n- If connection times out, check your internet connection first.\n- Try switching between TCP and UDP protocols.\n- Ensure your firewall is not blocking the VPN port.\n- Contact IT support if the issue persists after these steps.' },
    { title: 'Password Reset Policy', desc: 'Company password reset procedures and requirements.', content: 'Password Reset Policy\n\nPasswords must be changed every 90 days.\nMinimum 12 characters with uppercase, lowercase, numbers, and special characters.\nCannot reuse last 5 passwords.\n\nTo reset: Go to SSO portal > My Account > Change Password.\nIf locked out, contact IT helpdesk.' },
    { title: 'Employee Onboarding Checklist', desc: 'Complete checklist for new employee onboarding.', content: 'Onboarding Checklist\n\n1. Complete HR paperwork\n2. Set up workstation\n3. Configure email and accounts\n4. Badge and building access\n5. Team introduction\n6. System training\n7. Benefits enrollment\n8. First week goals review' },
    { title: 'Expense Report Guidelines', desc: 'How to submit and manage expense reports.', content: 'Expense Report Guidelines\n\nSubmit within 30 days of expense.\nInclude receipts for all items over $25.\nUse the expense management portal.\nApproval required from direct manager.\nReimbursement processed within 2 pay cycles.' },
    { title: 'IT Equipment Request Process', desc: 'Process for requesting new IT equipment.', content: 'IT Equipment Request\n\nFill out the IT request form on the intranet.\nSpecify equipment type and business justification.\nManager approval required for items over $500.\nStandard delivery: 5-7 business days.\nUrgent requests: Contact IT directly.' },
  ];

  for (const doc of kbDocs) {
    await prisma.knowledgeDocument.create({
      data: { title: doc.title, description: doc.desc, filename: `${doc.title.toLowerCase().replace(/\s+/g, '_')}.txt`, originalName: `${doc.title}.txt`, mimeType: 'text/plain', size: doc.content.length, url: 'https://via.placeholder.com/400x300', status: 'processed', chunkCount: 3 },
    });
  }
  console.log(`✅ Created ${kbDocs.length} knowledge documents`);

  // Create audit logs
  for (let i = 0; i < 30; i++) {
    await prisma.auditLog.create({
      data: {
        action: pick(['CREATE_TICKET', 'UPDATE_TICKET', 'LOGIN', 'UPLOAD_DOCUMENT']),
        entity: pick(['Ticket', 'User', 'KnowledgeDocument']),
        entityId: pick(createdTickets).id,
        userId: pick(createdUsers).id,
        details: { info: 'Seeded audit log entry' },
        createdAt: new Date(Date.now() - rand(0, 30) * 24 * 3600000),
      },
    });
  }
  console.log('✅ Created audit logs');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Demo Accounts:');
  console.log('  Admin:    admin@copilot.dev / password123');
  console.log('  Agent:    agent1@copilot.dev / password123');
  console.log('  Employee: emp1@copilot.dev / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
