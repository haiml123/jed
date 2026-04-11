import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.lessonAssignment.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.keyTakeaway.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  // NOTE: In production, passwords should be hashed using bcrypt or argon2.
  // Plain text passwords are used here for demo/seed purposes only.
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      name: 'Jane Teacher',
      password: 'password123',
      role: 'TEACHER',
      school: 'JKG Academy',
      lastLoginAt: new Date(),
    },
  });

  const director = await prisma.user.create({
    data: {
      email: 'director@school.com',
      name: 'John Director',
      password: 'password123',
      role: 'DIRECTOR',
      school: 'JKG Academy',
      lastLoginAt: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      name: 'Alice Admin',
      password: 'password123',
      role: 'ADMIN',
      school: 'JKG Academy',
      lastLoginAt: new Date(),
    },
  });

  console.log('Created users:', { teacher: teacher.email, director: director.email, admin: admin.email });

  // --- Lesson 1: Setting Clear Expectations (mandatory, 2 units) ---
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Setting Clear Expectations',
      topic: 'Classroom Management',
      description: 'Learn how to establish and communicate clear expectations in your classroom to foster a positive learning environment.',
      isMandatory: true,
      isOptional: false,
      status: 'PUBLISHED',
      order: 1,
      videoDuration: 0,
      units: {
        create: [
          {
            title: 'Why Expectations Matter',
            description: 'Understand the research behind setting clear expectations and how it impacts student outcomes.',
            order: 1,
            keyTakeaways: {
              create: [
                { text: 'Clear expectations reduce behavioral issues by up to 30%', order: 1 },
                { text: 'Students perform better when they understand what is expected of them', order: 2 },
                { text: 'Consistent expectations build trust between teachers and students', order: 3 },
                { text: 'Expectations should be co-created with students when possible', order: 4 },
              ],
            },
            quizQuestions: {
              create: [
                {
                  text: 'What is the primary benefit of setting clear expectations?',
                  order: 1,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'It makes grading easier', isCorrect: false },
                      { text: 'It reduces behavioral issues and improves student outcomes', isCorrect: true },
                      { text: 'It satisfies administrative requirements', isCorrect: false },
                      { text: 'It reduces the need for lesson planning', isCorrect: false },
                    ],
                  },
                },
                {
                  text: 'When should expectations be introduced to students?',
                  order: 2,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'Only at the beginning of the school year', isCorrect: false },
                      { text: 'After the first behavioral issue occurs', isCorrect: false },
                      { text: 'Early and revisited regularly throughout the year', isCorrect: true },
                      { text: 'Only during parent-teacher conferences', isCorrect: false },
                    ],
                  },
                },
                {
                  text: 'How can expectations be made more effective?',
                  order: 3,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'By making them as strict as possible', isCorrect: false },
                      { text: 'By co-creating them with students', isCorrect: true },
                      { text: 'By keeping them secret until needed', isCorrect: false },
                      { text: 'By changing them frequently to keep students guessing', isCorrect: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Communicating Expectations Effectively',
            description: 'Practical strategies for communicating your expectations clearly and consistently.',
            order: 2,
            keyTakeaways: {
              create: [
                { text: 'Use positive language when framing expectations', order: 1 },
                { text: 'Post expectations visually in your classroom', order: 2 },
                { text: 'Model the expected behavior for students', order: 3 },
                { text: 'Provide specific praise when expectations are met', order: 4 },
              ],
            },
            quizQuestions: {
              create: [
                {
                  text: 'Which is an example of positive expectation framing?',
                  order: 1,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: '"Don\'t run in the hallway"', isCorrect: false },
                      { text: '"Walk safely in the hallway"', isCorrect: true },
                      { text: '"Stop being loud"', isCorrect: false },
                      { text: '"No talking during tests"', isCorrect: false },
                    ],
                  },
                },
                {
                  text: 'What is the best way to reinforce expectations?',
                  order: 2,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'Punishing students who don\'t meet them', isCorrect: false },
                      { text: 'Ignoring when expectations are met', isCorrect: false },
                      { text: 'Providing specific praise when expectations are met', isCorrect: true },
                      { text: 'Only addressing expectations during assemblies', isCorrect: false },
                    ],
                  },
                },
                {
                  text: 'Why is modeling expected behavior important?',
                  order: 3,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'Students learn better by seeing behavior demonstrated', isCorrect: true },
                      { text: 'It is required by school policy', isCorrect: false },
                      { text: 'It takes less time than explaining', isCorrect: false },
                      { text: 'It only works for younger students', isCorrect: false },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Created lesson:', lesson1.title);

  // --- Lesson 2: Advanced Classroom Strategies (optional, 2 units) ---
  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Advanced Classroom Strategies',
      topic: 'Classroom Management',
      description: 'Explore advanced strategies for managing complex classroom dynamics and engaging diverse learners.',
      isMandatory: false,
      isOptional: true,
      status: 'PUBLISHED',
      order: 2,
      videoDuration: 0,
      units: {
        create: [
          {
            title: 'Differentiated Instruction',
            description: 'Learn how to tailor your instruction to meet the diverse needs of all learners in your classroom.',
            order: 1,
            keyTakeaways: {
              create: [
                { text: 'Differentiation can be applied to content, process, product, and environment', order: 1 },
                { text: 'Pre-assessment data helps inform differentiation strategies', order: 2 },
                { text: 'Flexible grouping allows students to work at their level', order: 3 },
                { text: 'Technology can support differentiated instruction at scale', order: 4 },
              ],
            },
            quizQuestions: {
              create: [
                {
                  text: 'What are the four areas where differentiation can be applied?',
                  order: 1,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'Reading, writing, math, and science', isCorrect: false },
                      { text: 'Content, process, product, and environment', isCorrect: true },
                      { text: 'Visual, auditory, kinesthetic, and reading', isCorrect: false },
                      { text: 'Planning, teaching, assessing, and reflecting', isCorrect: false },
                    ],
                  },
                },
                {
                  text: 'What is the purpose of pre-assessment in differentiation?',
                  order: 2,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'To assign grades early in the unit', isCorrect: false },
                      { text: 'To inform instructional decisions and grouping', isCorrect: true },
                      { text: 'To identify students who should be removed from class', isCorrect: false },
                      { text: 'To satisfy administrative requirements', isCorrect: false },
                    ],
                  },
                },
                {
                  text: 'What is flexible grouping?',
                  order: 3,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'Allowing students to choose their own seats', isCorrect: false },
                      { text: 'Keeping students in the same group all year', isCorrect: false },
                      { text: 'Grouping students differently based on activity and need', isCorrect: true },
                      { text: 'Letting students work alone whenever they want', isCorrect: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Engaging Reluctant Learners',
            description: 'Strategies for motivating and engaging students who are disengaged or resistant to learning.',
            order: 2,
            keyTakeaways: {
              create: [
                { text: 'Reluctance often stems from fear of failure or lack of relevance', order: 1 },
                { text: 'Building relationships is the foundation of engagement', order: 2 },
                { text: 'Choice and autonomy increase student motivation', order: 3 },
                { text: 'Celebrate progress, not just achievement', order: 4 },
              ],
            },
            quizQuestions: {
              create: [
                {
                  text: 'What is often the root cause of student reluctance?',
                  order: 1,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'Laziness and lack of effort', isCorrect: false },
                      { text: 'Fear of failure or lack of perceived relevance', isCorrect: true },
                      { text: 'Too much homework', isCorrect: false },
                      { text: 'Poor school facilities', isCorrect: false },
                    ],
                  },
                },
                {
                  text: 'What is the foundation of student engagement?',
                  order: 2,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'Strict discipline policies', isCorrect: false },
                      { text: 'Advanced technology in the classroom', isCorrect: false },
                      { text: 'Building strong teacher-student relationships', isCorrect: true },
                      { text: 'Frequent testing and assessment', isCorrect: false },
                    ],
                  },
                },
                {
                  text: 'How does student choice affect motivation?',
                  order: 3,
                  xpValue: 10,
                  options: {
                    create: [
                      { text: 'It has no significant effect', isCorrect: false },
                      { text: 'It decreases motivation because students get confused', isCorrect: false },
                      { text: 'It increases motivation by providing autonomy', isCorrect: true },
                      { text: 'It only works for advanced students', isCorrect: false },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Created lesson:', lesson2.title);

  // --- Group: All Teachers ---
  const group = await prisma.group.create({
    data: {
      name: 'All Teachers',
      description: 'Default group containing all teachers in the school.',
      directorId: director.id,
      members: {
        create: [
          { userId: teacher.id },
        ],
      },
    },
  });

  console.log('Created group:', group.name);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
