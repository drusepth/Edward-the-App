import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test
} from '../_imports'
import { addDocument } from './_document.helper'
import { addPlan, checkPlans } from './_plan.helper'
import { addSection, compareSections } from './_section.helper'

stubRecaptcha(test)

/*
  TESTS
*/

let app, doc, plan
test.beforeEach('set up a premium user and document', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
  doc = await addDocument(app, 'Test1')
  plan = await addPlan(app, doc.id, 'Test1')
})

test('add sections', async t => {
  const section1 = await addSection(app, doc.id, plan.planId, 'Test1')
  const section2 = await addSection(app, doc.id, plan.planId, 'Test2')

  plan.sections = [section1, section2]

  return checkPlans(t, app, doc.id, ([apiPlan]) => {
    const sections = apiPlan.sections
    t.is(sections.length, 2)
    compareSections(t, doc.id, plan.planId, sections[0], section1)
    compareSections(t, doc.id, plan.planId, sections[1], section2)
  })
})

test('arrange sections', async t => {
  const section1 = await addSection(app, doc.id, plan.planId, 'Test1')
  const section2 = await addSection(app, doc.id, plan.planId, 'Test2')

  await (
    app.post(route('section/arrange'))
    .send({
      fileId: doc.id,
      planId: plan.planId,
      sectionIds: [section2.sectionId, section1.sectionId]
    })
    .expect(200)
  )

  return checkPlans(t, app, doc.id, ([apiPlan]) => {
    const sections = apiPlan.sections
    t.is(sections.length, 2)
    compareSections(t, doc.id, plan.planId, sections[0], section2)
    compareSections(t, doc.id, plan.planId, sections[1], section1)
  })
})

test('update section', async t => {
  const section1 = await addSection(app, doc.id, plan.planId, 'Test1')
  const section2 = await addSection(app, doc.id, plan.planId, 'Test2')

  const newSection = {
    fileId: doc.id,
    planId: plan.planId,
    sectionId: section1.sectionId,
    section: {
      archived: true,
      content: {
        ops: [{
          insert: 'test'
        }]
      },
      id: section1.sectionId,
      tags: ['test-tag'],
      title: 'Test1-updated'
    }
  }

  plan.sections = [newSection, section2]

  await (
    app.post(route('section/update'))
    .send(newSection)
    .expect(200)
  )

  return checkPlans(t, app, doc.id, ([apiPlan]) => {
    const sections = apiPlan.sections
    t.is(sections.length, 2)
    compareSections(t, doc.id, plan.planId, sections[0], newSection)
    compareSections(t, doc.id, plan.planId, sections[1], section2)
  })
})
