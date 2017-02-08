import test from 'ava'
import AramRanked from '../js/aram-ranked'

test('AramRanked.getServers (static)', t => {
  const servers = AramRanked.getServers()
  Object.keys(servers).forEach((server) => {
    t.truthy(typeof servers[server] === 'string')
  })
  t.truthy(typeof servers === 'object')
})

test('aramRanked.getUserByName', async t => {
  const aramRanked = new AramRanked('euw')
  const user = await aramRanked.getUserByName('kupluss warwick')
  t.is(user.isNew, false, 'plop')
})
