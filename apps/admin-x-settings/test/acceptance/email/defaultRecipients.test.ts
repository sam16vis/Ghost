import {chooseOptionInSelect, globalDataRequests, mockApi, responseFixtures, updatedSettingsResponse} from '../../utils/acceptance';
import {expect, test} from '@playwright/test';

test.describe('Default recipient settings', async () => {
    test('Supports editing default recipients', async ({page}) => {
        const {lastApiRequests} = await mockApi({page, requests: {
            ...globalDataRequests,
            editSettings: {method: 'PUT', path: '/settings/', response: updatedSettingsResponse([
                {key: 'editor_default_email_recipients', value: 'filter'},
                {key: 'editor_default_email_recipients_filter', value: 'status:-free'}
            ])}
        }});

        await page.goto('/');

        const section = page.getByTestId('default-recipients');

        await expect(section.getByText('Whoever has access to the post')).toHaveCount(1);

        await section.getByRole('button', {name: 'Edit'}).click();
        await chooseOptionInSelect(section.getByLabel('Default newsletter recipients'), 'All members');
        await section.getByRole('button', {name: 'Save'}).click();

        expect(lastApiRequests.editSettings?.body).toEqual({
            settings: [
                {key: 'editor_default_email_recipients', value: 'filter'},
                {key: 'editor_default_email_recipients_filter', value: 'status:free,status:-free'}
            ]
        });

        await section.getByRole('button', {name: 'Edit'}).click();
        await chooseOptionInSelect(section.getByLabel('Default newsletter recipients'), 'Usually nobody');
        await section.getByRole('button', {name: 'Save'}).click();

        expect(lastApiRequests.editSettings?.body).toEqual({
            settings: [
                {key: 'editor_default_email_recipients', value: 'filter'},
                {key: 'editor_default_email_recipients_filter', value: null}
            ]
        });

        await section.getByRole('button', {name: 'Edit'}).click();
        await chooseOptionInSelect(section.getByLabel('Default newsletter recipients'), 'Paid-members only');
        await section.getByRole('button', {name: 'Save'}).click();

        await expect(section.getByLabel('Default newsletter recipients')).toHaveCount(0);

        await expect(section.getByText('Paid-members only')).toHaveCount(1);

        expect(lastApiRequests.editSettings?.body).toEqual({
            settings: [
                {key: 'editor_default_email_recipients', value: 'filter'},
                {key: 'editor_default_email_recipients_filter', value: 'status:-free'}
            ]
        });
    });

    test('Supports selecting specific tiers, labels and offers', async ({page}) => {
        const {lastApiRequests} = await mockApi({page, requests: {
            ...globalDataRequests,
            browseTiers: {method: 'GET', path: '/tiers/?filter=&limit=20', response: responseFixtures.tiers},
            browseLabels: {method: 'GET', path: '/labels/?filter=&limit=20', response: responseFixtures.labels},
            browseOffers: {method: 'GET', path: '/offers/?filter=&limit=20', response: responseFixtures.offers},
            editSettings: {method: 'PUT', path: '/settings/', response: updatedSettingsResponse([
                {
                    key: 'editor_default_email_recipients',
                    value: 'filter'
                },
                {
                    key: 'editor_default_email_recipients_filter',
                    value: '645453f4d254799990dd0e22,label:first-label,offer_redemptions:6487ea6464fca78ec2fff5fe'
                }
            ])}
        }});

        await page.goto('/');

        const section = page.getByTestId('default-recipients');

        await section.getByRole('button', {name: 'Edit'}).click();

        await chooseOptionInSelect(section.getByLabel('Default newsletter recipients'), 'Specific people');
        await section.getByLabel('Filter').click();

        await section.locator('[data-testid="select-option"]', {hasText: 'Basic Supporter'}).click();
        await section.locator('[data-testid="select-option"]', {hasText: 'first-label'}).click();
        await section.locator('[data-testid="select-option"]', {hasText: 'First offer'}).click();

        await section.getByRole('button', {name: 'Save'}).click();

        await expect(section.getByText('Specific people')).toHaveCount(1);

        expect(lastApiRequests.editSettings?.body).toEqual({
            settings: [
                {
                    key: 'editor_default_email_recipients',
                    value: 'filter'
                },
                {
                    key: 'editor_default_email_recipients_filter',
                    value: '645453f4d254799990dd0e22,label:first-label,offer_redemptions:6487ea6464fca78ec2fff5fe'
                }
            ]
        });
    });
});
