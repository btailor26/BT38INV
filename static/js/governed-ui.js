(function () {
  'use strict';

  async function governedPost(url, payload) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload || {})
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(
        data.error ||
        data.message ||
        `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function governedPushListing(listingId, payload = {}) {
    if (!listingId) {
      throw new Error('listingId is required');
    }

    return governedPost(
      `/governed/actions/listings/${listingId}/push`,
      payload
    );
  }

  async function governedBulkPush(listingIds) {
    const ids = Array.isArray(listingIds)
      ? listingIds.filter(Boolean)
      : [];

    if (!ids.length) {
      throw new Error('No listing IDs supplied');
    }

    const results = [];

    for (const id of ids) {
      const result = await governedPushListing(id);
      results.push(result);
    }

    return {
      success: true,
      results,
      total: results.length
    };
  }

  async function governedPushGroup(groupId, listingIds) {
    if (!groupId) {
      throw new Error('groupId is required');
    }

    const ids = Array.isArray(listingIds)
      ? listingIds.filter(Boolean)
      : [];

    if (!ids.length) {
      throw new Error('listing_ids required');
    }

    return governedPost(
      `/groups/${groupId}/push`,
      {
        listing_ids: ids
      }
    );
  }

  async function governedPushSelectedFromDOM() {
    const ids = Array.from(
      document.querySelectorAll('.item-checkbox:checked')
    )
      .map(cb => parseInt(cb.value, 10))
      .filter(Boolean);

    if (!ids.length) {
      alert('No items selected');
      return;
    }

    try {
      const result = await governedBulkPush(ids);

      alert(
        `Governed push queued for ${result.total} item(s)`
      );
    } catch (err) {
      alert(`Push failed: ${err.message}`);
    }
  }

  async function governedPushAllFromDOM() {
    const ids = Array.from(
      document.querySelectorAll('.item-checkbox')
    )
      .map(cb => parseInt(cb.value, 10))
      .filter(Boolean);

    if (!ids.length) {
      alert('No items available');
      return;
    }

    if (!confirm(`Push ${ids.length} item(s)?`)) {
      return;
    }

    try {
      const result = await governedBulkPush(ids);

      alert(
        `Governed push queued for ${result.total} item(s)`
      );
    } catch (err) {
      alert(`Push failed: ${err.message}`);
    }
  }

  window.governedPushListing = governedPushListing;
  window.governedBulkPush = governedBulkPush;
  window.governedPushGroup = governedPushGroup;
  window.governedPushSelectedFromDOM = governedPushSelectedFromDOM;
  window.governedPushAllFromDOM = governedPushAllFromDOM;
})();
