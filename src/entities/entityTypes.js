// entityTypes.js - Adaptación de EntityType.res para JavaScript

// Tipos de filtros iniciales
export const createInitialFilter = (field, localFilter = null) => ({
  field,
  localFilter
});

// Tipos de opciones
export const createOptionType = (urlKey = "", field = null, parser = (json) => json, localFilter = null) => ({
  urlKey,
  field,
  parser,
  localFilter
});

// Función para obtener tipo de opción por defecto
export const getDefaultEntityOptionType = () => ({
  urlKey: "",
  field: { name: "" },
  parser: (json) => json,
  localFilter: null
});

// Tipo de resumen
export const createSummary = (totalCount = 0, count = 0) => ({
  totalCount,
  count
});

// Función para obtener resumen por defecto
export const defaultGetSummary = (json, totalCountKey = "totalCount") => {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    if (data && typeof data === 'object') {
      const totalCount = data[totalCountKey] || 0;
      const count = data.count || 0;
      
      if (totalCount < count) {
        return { totalCount: count, count };
      }
      
      return { totalCount, count };
    }
  } catch (error) {
    console.error('Error parsing summary:', error);
  }
  
  return { totalCount: 0, count: 0 };
};

// Objeto vacío por defecto
export const emptyObj = {
  offset: 0
};

// Función para crear entidad
export const makeEntity = ({
  uri,
  getObjects,
  defaultColumns,
  allColumns = null,
  getHeading,
  getCell,
  dataKey = "list",
  summaryKey = "summary",
  totalCountKey = "totalCount",
  getSummary = (json) => defaultGetSummary(json, totalCountKey),
  detailsKey = "payload",
  getShowLink = null,
  getNewUrl = () => "",
  defaultFilters = emptyObj,
  initialFilters = [],
  options = [],
  getDetailsUri = () => "",
  headers = {},
  getSyncUrl = () => null,
  detailsPageLayout = () => null,
  searchFields = [],
  searchUrl = "",
  searchKeyList = [],
  optionalSearchFieldsList = [],
  requiredSearchFieldsList = [],
  popupFilterFields = [],
  dateRangeFilterDict = {},
  searchValueDict = null,
  filterCheck = () => false,
  filterForRow = () => ({ key: "", options: [], selected: [] })
}) => ({
  uri,
  getObjects,
  defaultColumns,
  allColumns,
  getHeading,
  getCell,
  dataKey,
  summaryKey,
  getSummary,
  detailsKey,
  getShowLink,
  defaultFilters,
  searchValueDict,
  initialFilters,
  options,
  getDetailsUri,
  headers,
  getNewUrl,
  getSyncUrl,
  detailsPageLayout,
  searchFields,
  searchUrl,
  searchKeyList,
  optionalSearchFieldsList,
  requiredSearchFieldsList,
  popupFilterFields,
  dateRangeFilterDict,
  filterCheck,
  filterForRow
});

// Tipos de columnas comunes
export const COLUMN_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  STATUS: 'status',
  AMOUNT: 'amount',
  LINK: 'link',
  ACTIONS: 'actions'
};

// Estados comunes
export const COMMON_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Funciones de utilidad para entidades
export const EntityUtils = {
  // Función para formatear datos de tabla
  formatTableData: (data, columns) => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => {
      const formattedItem = {};
      columns.forEach(column => {
        formattedItem[column.key] = item[column.key] || '';
      });
      return formattedItem;
    });
  },

  // Función para filtrar datos
  filterData: (data, filters) => {
    if (!Array.isArray(data) || !filters) return data;
    
    return data.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        const itemValue = item[key];
        
        if (!filterValue) return true;
        
        if (typeof filterValue === 'string') {
          return itemValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
        }
        
        return itemValue === filterValue;
      });
    });
  },

  // Función para ordenar datos
  sortData: (data, sortKey, sortOrder = 'asc') => {
    if (!Array.isArray(data)) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  },

  // Función para paginar datos
  paginateData: (data, page = 1, pageSize = 10) => {
    if (!Array.isArray(data)) return { data: [], totalPages: 0, currentPage: 1 };
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / pageSize);
    
    return {
      data: paginatedData,
      totalPages,
      currentPage: page,
      totalItems: data.length
    };
  }
};

export default {
  createInitialFilter,
  createOptionType,
  getDefaultEntityOptionType,
  createSummary,
  defaultGetSummary,
  emptyObj,
  makeEntity,
  COLUMN_TYPES,
  COMMON_STATUSES,
  EntityUtils
};

