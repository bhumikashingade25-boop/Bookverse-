// In-Memory Resilient Document Database for BookVerse Hackathon Execution
// Zero-latency, instant startup, 100% offline & portable

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  _generateId() {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  _clone(doc) {
    if (!doc) return null;
    const cloned = JSON.parse(JSON.stringify(doc));
    cloned.save = async function() {
      return this;
    };
    return cloned;
  }

  _matches(doc, filter = {}) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, val] of Object.entries(filter)) {
      if (key === '$or' && Array.isArray(val)) {
        if (!val.some(subFilter => this._matches(doc, subFilter))) return false;
        continue;
      }
      if (val && typeof val === 'object' && val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(doc[key] || '')) return false;
        continue;
      }
      if (val && typeof val === 'object' && val.$in) {
        if (!val.$in.includes(doc[key])) return false;
        continue;
      }
      if (key === '_id' || key === 'owner' || key === 'user' || key === 'author' || key === 'requester' || key === 'recipient' || key === 'admin') {
        const docVal = doc[key]?._id ? doc[key]._id.toString() : doc[key]?.toString();
        const searchVal = val?._id ? val._id.toString() : val?.toString();
        if (docVal !== searchVal) return false;
        continue;
      }
      if (doc[key] !== val) return false;
    }
    return true;
  }

  async countDocuments(filter = {}) {
    return this.docs.filter(d => this._matches(d, filter)).length;
  }

  async deleteMany(filter = {}) {
    const beforeCount = this.docs.length;
    this.docs = this.docs.filter(d => !this._matches(d, filter));
    return { acknowledged: true, deletedCount: beforeCount - this.docs.length };
  }

  async insertMany(items = []) {
    const inserted = items.map(item => {
      const doc = {
        _id: item._id || this._generateId(),
        ...item,
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date()
      };
      this.docs.push(doc);
      return this._clone(doc);
    });
    return inserted;
  }

  async create(data) {
    const doc = {
      _id: data._id || this._generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.docs.push(doc);
    return this._clone(doc);
  }

  find(filter = {}) {
    const populates = [];
    let sortField = null;
    let limitCount = 0;
    let selectFields = null;

    const query = {
      sort(s) {
        sortField = s;
        return query;
      },
      limit(l) {
        limitCount = l;
        return query;
      },
      select(fields) {
        selectFields = fields;
        return query;
      },
      populate(field, select) {
        populates.push({ field, select });
        return query;
      },
      then: (resolve, reject) => {
        try {
          let results = this.docs.filter(d => this._matches(d, filter)).map(d => this._clone(d));
          if (sortField) {
            const key = typeof sortField === 'string' ? sortField.replace('-', '') : Object.keys(sortField)[0];
            const isDesc = typeof sortField === 'string' ? sortField.startsWith('-') : sortField[key] === -1;
            results.sort((a, b) => (a[key] > b[key] ? (isDesc ? -1 : 1) : (isDesc ? 1 : -1)));
          }
          if (limitCount > 0) {
            results = results.slice(0, limitCount);
          }
          for (const pop of populates) {
            for (const doc of results) {
              if (doc && doc[pop.field]) {
                const targetCol = memoryStore.getCollectionForField(pop.field);
                if (targetCol) {
                  const targetId = (doc[pop.field]?._id || doc[pop.field]).toString();
                  const targetDoc = targetCol.docs.find(t => t._id.toString() === targetId);
                  if (targetDoc) {
                    doc[pop.field] = this._clone(targetDoc);
                  }
                }
              }
            }
          }
          return Promise.resolve(results).then(resolve, reject);
        } catch (e) {
          return Promise.reject(e).then(resolve, reject);
        }
      }
    };
    return query;
  }

  findOne(filter = {}) {
    const populates = [];
    const query = {
      select(fields) {
        return query;
      },
      populate(field, select) {
        populates.push({ field, select });
        return query;
      },
      then: (resolve, reject) => {
        try {
          const doc = this.docs.find(d => this._matches(d, filter));
          const cloned = this._clone(doc);
          if (cloned) {
            for (const pop of populates) {
              if (cloned[pop.field]) {
                const targetCol = memoryStore.getCollectionForField(pop.field);
                if (targetCol) {
                  const targetId = (cloned[pop.field]?._id || cloned[pop.field]).toString();
                  const targetDoc = targetCol.docs.find(t => t._id.toString() === targetId);
                  if (targetDoc) {
                    cloned[pop.field] = this._clone(targetDoc);
                  }
                }
              }
            }
          }
          return Promise.resolve(cloned).then(resolve, reject);
        } catch (e) {
          return Promise.reject(e).then(resolve, reject);
        }
      }
    };
    return query;
  }

  findById(id) {
    const idStr = id?._id ? id._id.toString() : id?.toString();
    return this.findOne({ _id: idStr });
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const idStr = id?._id ? id._id.toString() : id?.toString();
    const idx = this.docs.findIndex(d => d._id.toString() === idStr);
    if (idx === -1) return null;

    if (update.$inc) {
      for (const [k, v] of Object.entries(update.$inc)) {
        this.docs[idx][k] = (this.docs[idx][k] || 0) + v;
      }
    }
    if (update.$set) {
      Object.assign(this.docs[idx], update.$set);
    }
    const cleanUpdate = { ...update };
    delete cleanUpdate.$inc;
    delete cleanUpdate.$set;
    Object.assign(this.docs[idx], cleanUpdate, { updatedAt: new Date() });

    return this._clone(this.docs[idx]);
  }
}

class MemoryStore {
  constructor() {
    this.collections = {};
  }

  getCollection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new MemoryCollection(name);
    }
    return this.collections[name];
  }

  getCollectionForField(field) {
    if (field === 'owner' || field === 'user' || field === 'author' || field === 'requester' || field === 'recipient' || field === 'admin') {
      return this.collections['User'];
    }
    if (field === 'book' || field === 'requestedBook' || field === 'offeredBook') {
      return this.collections['Book'];
    }
    return null;
  }
}

const memoryStore = new MemoryStore();

module.exports = {
  memoryStore,
  MemoryCollection
};
