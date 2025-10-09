import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testMembers = [
  {
    email: 'sarah.chen@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Sarah Chen',
      title: 'VP of Engineering',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      bio: 'Building scalable systems and leading high-performing teams. Former engineer at Google and Stripe.',
      expertise: ['Engineering Leadership', 'System Architecture', 'Team Building', 'Hiring'],
      needs: ['Fundraising Connections', 'Sales Leadership Advice'],
      is_founding_member: true,
      status: 'active'
    }
  },
  {
    email: 'michael.rodriguez@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Michael Rodriguez',
      title: 'Founder & CEO',
      company: 'GrowthLabs',
      location: 'Austin, TX',
      bio: 'Serial entrepreneur with 2 exits. Helping startups find product-market fit.',
      expertise: ['Product Strategy', 'Fundraising', 'Growth Marketing', 'B2B SaaS'],
      needs: ['Engineering Talent', 'Technical Co-founder'],
      is_founding_member: true,
      status: 'active'
    }
  },
  {
    email: 'emily.watson@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Emily Watson',
      title: 'Head of Product',
      company: 'DataFlow',
      location: 'New York, NY',
      bio: 'Product leader passionate about user experience and data-driven decision making.',
      expertise: ['Product Management', 'UX Design', 'Analytics', 'User Research'],
      needs: ['Enterprise Sales Expertise', 'B2B Partnerships'],
      is_founding_member: true,
      status: 'active'
    }
  },
  {
    email: 'james.kim@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'James Kim',
      title: 'Partner',
      company: 'Vertex Ventures',
      location: 'Palo Alto, CA',
      bio: 'Venture capitalist investing in early-stage SaaS and AI companies.',
      expertise: ['Venture Capital', 'SaaS', 'Business Strategy', 'Investor Relations'],
      needs: ['Deal Flow', 'Technical Diligence Help'],
      is_founding_member: true,
      status: 'active'
    }
  },
  {
    email: 'alexandra.patel@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Alexandra Patel',
      title: 'CMO',
      company: 'BrandWorks',
      location: 'Los Angeles, CA',
      bio: 'Marketing executive specializing in brand building and demand generation.',
      expertise: ['Marketing Strategy', 'Brand Building', 'Content Marketing', 'PR'],
      needs: ['Technical Marketing Tools', 'Marketing Automation'],
      is_founding_member: true,
      status: 'active'
    }
  }
];

async function createTestMembers() {
  console.log('🚀 Starting test member creation...\n');
  
  for (const member of testMembers) {
    console.log(`\n📧 Creating account for ${member.email}...`);
    
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: member.email,
        password: member.password,
        email_confirm: true,
        user_metadata: {
          full_name: member.profile.full_name
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${member.email} already exists, checking profile...`);
          
          // Get existing user
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (listError) throw listError;
          
          const existingUser = users.find(u => u.email === member.email);
          if (!existingUser) throw new Error('User exists but could not be found');
          
          // Check if profile exists
          const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', existingUser.id)
            .single();

          if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            throw profileCheckError;
          }

          if (existingProfile) {
            console.log(`✅ Profile already exists for ${member.email}`);
            continue;
          }
          
          // Create profile for existing user
          console.log(`📝 Creating profile for existing user...`);
          const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: existingUser.id,
              email: member.email,
              full_name: member.profile.full_name,
              title: member.profile.title,
              company: member.profile.company,
              location: member.profile.location,
              bio: member.profile.bio,
              expertise: member.profile.expertise,
              needs: member.profile.needs,
              is_founding_member: member.profile.is_founding_member,
              status: member.profile.status,
              invites_remaining: 5
            });

          if (insertError) throw insertError;
          console.log(`✅ Profile created successfully for ${member.email}`);
          continue;
        }
        throw authError;
      }

      console.log(`✅ Auth user created with ID: ${authData.user.id}`);

      // Step 2: Create profile
      console.log(`📝 Creating profile...`);
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: member.email,
          full_name: member.profile.full_name,
          title: member.profile.title,
          company: member.profile.company,
          location: member.profile.location,
          bio: member.profile.bio,
          expertise: member.profile.expertise,
          needs: member.profile.needs,
          is_founding_member: member.profile.is_founding_member,
          status: member.profile.status,
          invites_remaining: 5
        });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        throw profileError;
      }

      console.log(`✅ Profile created successfully for ${member.profile.full_name}`);
      
    } catch (error) {
      console.error(`❌ Error creating ${member.email}:`, error.message);
      console.error('Full error:', error);
    }
  }

  console.log('\n\n🎉 Test member creation complete!');
  console.log('\n📊 Verifying members...\n');

  // Verify all profiles were created
  const { data: profiles, error: verifyError } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name, title, company')
    .in('email', testMembers.map(m => m.email));

  if (verifyError) {
    console.error('❌ Verification error:', verifyError);
  } else {
    console.log('✅ Verified profiles:');
    profiles.forEach(p => {
      console.log(`   • ${p.full_name} (${p.email}) - ${p.title} at ${p.company}`);
    });
  }
}

createTestMembers().catch(console.error);
