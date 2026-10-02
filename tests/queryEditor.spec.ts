import { test, expect } from '@grafana/plugin-e2e';

test('smoke: should render query editor', async ({ panelEditPage, readProvisionedDataSource }) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);

  const row = panelEditPage.getQueryEditorRow('A');
  await expect(row.getByLabel('Queue')).toBeVisible();
  await expect(row.getByLabel('Limit')).toBeVisible();
  await expect(row.getByLabel('Payload format')).toBeVisible();
});

test('the query editor has no Message VPN field, it belongs to the data source', async ({
  panelEditPage,
  readProvisionedDataSource,
}) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);

  await expect(panelEditPage.getQueryEditorRow('A').getByLabel('Message VPN')).toBeHidden();
});

test('the queue name is kept in the query', async ({ panelEditPage, readProvisionedDataSource }) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);

  // No assertion on query results here: this plugin runs its query in the
  // browser, so there is no /api/ds/query response for panelEditPage.refreshPanel()
  // to wait on. What the editor owns is the query model, so that is what is tested.
  const queue = panelEditPage.getQueryEditorRow('A').getByLabel('Queue');
  await queue.fill('demo/orders/1');

  await expect(queue).toHaveValue('demo/orders/1');
});

test('the payload formats are offered', async ({ panelEditPage, readProvisionedDataSource, page }) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);

  await panelEditPage.getQueryEditorRow('A').getByLabel('Payload format').click();

  // Grafana's Combobox gives an option no aria-label, so its accessible name is
  // the label plus the description ("AutoPretty JSON, …"). Match on the label text.
  for (const format of ['Auto', 'JSON', 'Text', 'Base64', 'Hex']) {
    const option = page.getByRole('option').filter({ has: page.getByText(format, { exact: true }) });
    await expect(option).toBeVisible();
  }
});
