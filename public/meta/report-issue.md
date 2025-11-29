# Report an Issue

<div class="sunder-form-card">

<p class="sunder-form-lead">
If you spot a typo, unclear rule, or anything broken, you can use this form to let The Archivist know.
</p>

<form id="issue-form" class="sunder-form">

  <div class="sunder-form-row">
    <label for="issue-type">Issue type</label><br>
    <select id="issue-type" name="issue_type" class="sunder-input">
      <option value="rules">Rules / mechanics</option>
      <option value="typo">Typos / wording</option>
      <option value="layout">Layout / navigation</option>
      <option value="other">Other</option>
    </select>
  </div>

  <div class="form-row">
    <label for="issue-page">Page or section</label>
    <input 
        type="text" 
        id="issue-page" 
        name="page" 
        class="sunder-input"
        placeholder="e.g. Rules > Rolling Dice" 
    />
  </div>

  <div class="sunder-form-row">
    <label for="issue-description">What seems wrong?</label>
    <textarea 
        id="issue-description" 
        name="description" 
        rows="5" 
        class="sunder-input sunder-textarea"
        required
    ></textarea>
    <p class="sunder-help-text">
        Include enough detail for The Archivist to reproduce the issue.
    </p>
  </div>

  <div class="sunder-form-row">
    <label for="issue-contact">Optional contact</label>
    <input 
        type="text" 
        id="issue-contact" 
        name="contact" 
        class="sunder-input"
        placeholder="Discord tag, email, etc."
    />
  </div>

  <div class="sunder-form-actions">
    <button type="submit" class="sunder-btn sunder-btn-primary">
        Send report
    </button>
    <p id="issue-status" class="sunder-form-status" aria-live="polite"></p>
  </div>

</form>

</div>