import { encodeRecipe } from './recipe.js';
const $ = (id) => document.getElementById(id);
export function bindSharing(getToppings) {
  $('share').addEventListener('click', () => {
    const url = new URL(location.href);
    url.hash = 'recipe=' + encodeRecipe(getToppings());
    $('share-url').value = url.href;
    $('copy-status').textContent = '';
    $('share-dialog').showModal();
    $('share-url').select();
  });
  $('copy-link').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('share-url').value);
      $('copy-status').textContent = 'Copied. Send it to someone hungry.';
    } catch {
      $('share-url').focus();
      $('share-url').select();
      $('copy-status').textContent = 'Select the link above and copy it.';
    }
  });
}
