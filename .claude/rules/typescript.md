---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# TypeScript and paradigms

- Use arrow functions over regular functions
- Prevent usage of "else" if needed in if conditions:

```
// ❌ Uses else
if (user.isAdmin) {
  return grantAccess();
} else {
  return denyAccess();
}

// ✅ No else — return early
if (!user.isAdmin) {
  return denyAccess();
}
return grantAccess();

// ✅ Also fine — ternary when simple
return user.isAdmin ? grantAccess() : denyAccess();
```


## Paradigms

- Function composition pattern. Immutability is important.
