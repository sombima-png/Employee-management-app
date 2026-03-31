/**
 * Employee Management Application — HTML, CSS & JavaScript only (assignment).
 * Contacts stored in localStorage.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "employeeManagementContacts_assignment";

  function loadContacts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveContacts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function nextId(list) {
    var max = 0;
    list.forEach(function (c) {
      var n = parseInt(c.id, 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return max + 1;
  }

  function escAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function findContact(id) {
    var list = loadContacts();
    var n = parseInt(id, 10);
    for (var i = 0; i < list.length; i++) {
      if (parseInt(list[i].id, 10) === n) return list[i];
    }
    return null;
  }

  function distinctDepartments(list) {
    var seen = {};
    list.forEach(function (c) {
      var d = (c.department || "").trim();
      if (d) seen[d.toLowerCase()] = d;
    });
    return Object.keys(seen).length;
  }

  function countWithPosition(list) {
    return list.filter(function (c) {
      return (c.position || "").trim().length > 0;
    }).length;
  }

  function recentContacts(list, limit) {
    return list
      .slice()
      .sort(function (a, b) {
        return parseInt(b.id, 10) - parseInt(a.id, 10);
      })
      .slice(0, limit || 5);
  }

  /* ——— Home dashboard ——— */
  var dashTotal = document.getElementById("dash-total");
  var dashDept = document.getElementById("dash-departments");
  var dashPos = document.getElementById("dash-positions");
  var dashRecentBody = document.getElementById("dashboard-recent-body");
  var dashSearch = document.getElementById("dashboard-search");

  if (dashTotal && dashDept && dashPos && dashRecentBody) {
    function renderDashboardTable() {
      var list = loadContacts();
      var recent = recentContacts(list, 8);
      var q = (dashSearch && dashSearch.value.trim().toLowerCase()) || "";

      dashTotal.textContent = String(list.length);
      dashDept.textContent = String(distinctDepartments(list));
      dashPos.textContent = String(countWithPosition(list));

      dashRecentBody.innerHTML = "";
      if (recent.length === 0) {
        var tr0 = document.createElement("tr");
        tr0.innerHTML =
          '<td colspan="3" class="table-empty">No contacts yet. Add your first one from New Contact.</td>';
        dashRecentBody.appendChild(tr0);
        return;
      }

      var filtered = recent.filter(function (c) {
        if (!q) return true;
        var blob = (
          (c.fullName || "") +
          " " +
          (c.email || "") +
          " " +
          (c.department || "")
        ).toLowerCase();
        return blob.indexOf(q) !== -1;
      });

      if (filtered.length === 0) {
        var tr1 = document.createElement("tr");
        tr1.innerHTML =
          '<td colspan="3" class="table-empty">No rows match your filter.</td>';
        dashRecentBody.appendChild(tr1);
        return;
      }

      filtered.forEach(function (c) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" +
          escapeHtml(c.fullName) +
          "</td><td>" +
          escapeHtml(c.email) +
          "</td><td>" +
          escapeHtml(c.department) +
          "</td>";
        dashRecentBody.appendChild(tr);
      });
    }

    renderDashboardTable();
    if (dashSearch) {
      dashSearch.addEventListener("input", renderDashboardTable);
    }
    window.addEventListener("storage", function (e) {
      if (e.key === STORAGE_KEY) renderDashboardTable();
    });
    window.addEventListener("focus", renderDashboardTable);
  }

  /* ——— New Contact form ——— */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fullName = document.getElementById("fullName").value.trim();
      var email = document.getElementById("email").value.trim();
      var phone = document.getElementById("phone").value.trim();
      var department = document.getElementById("department").value.trim();
      var position = document.getElementById("position").value.trim();

      if (!fullName || !email || !phone || !department) {
        window.alert("Please fill in Full Name, Email, Phone, and Department.");
        return;
      }

      var list = loadContacts();
      list.push({
        id: nextId(list),
        fullName: fullName,
        email: email,
        phone: phone,
        department: department,
        position: position,
      });
      saveContacts(list);
      form.reset();
      window.alert("Contact saved. You can view it on View All Contacts.");
    });
  }

  /* ——— View All Contacts table ——— */
  var tbody = document.getElementById("contacts-tbody");
  if (tbody) {
    function renderTable() {
      var list = loadContacts();
      tbody.innerHTML = "";

      if (list.length === 0) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          '<td colspan="5" class="table-empty">No contacts yet. Add one on the New Contact page.</td>';
        tbody.appendChild(tr);
        return;
      }

      list.forEach(function (c) {
        var tr = document.createElement("tr");
        var id = escAttr(c.id);
        tr.innerHTML =
          "<td>" +
          escapeHtml(c.fullName) +
          "</td><td>" +
          escapeHtml(c.email) +
          "</td><td>" +
          escapeHtml(c.phone) +
          "</td><td>" +
          escapeHtml(c.department) +
          "</td><td class=\"actions-cell\">" +
          "<button type=\"button\" class=\"btn btn-small btn-details\" data-action=\"details\" data-id=\"" +
          id +
          "\">Details</button> " +
          "<button type=\"button\" class=\"btn btn-small btn-edit\" data-action=\"edit\" data-id=\"" +
          id +
          "\">Edit</button> " +
          "<button type=\"button\" class=\"btn btn-small btn-delete\" data-action=\"delete\" data-id=\"" +
          id +
          "\">Delete</button>" +
          "</td>";
        tbody.appendChild(tr);
      });
    }

    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-action]");
      if (!btn) return;

      var action = btn.getAttribute("data-action");
      var id = btn.getAttribute("data-id");
      var contact = findContact(id);

      if (action === "details") {
        if (!contact) return;
        window.alert(
          "Employee details\n\n" +
            "Name: " +
            contact.fullName +
            "\nEmail: " +
            contact.email +
            "\nPhone: " +
            contact.phone +
            "\nDepartment: " +
            contact.department +
            "\nPosition: " +
            (contact.position || "—")
        );
        return;
      }

      if (action === "edit") {
        window.alert("Edit Alert");
        return;
      }

      if (action === "delete") {
        if (!window.confirm("Are you sure you want to delete?")) return;
        var list = loadContacts().filter(function (c) {
          return String(c.id) !== String(id);
        });
        saveContacts(list);
        renderTable();
      }
    });

    renderTable();
  }
})();
