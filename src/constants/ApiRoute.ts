export const BASE_URL = "https://appapi.estateai.in/api";
//https://live-project-backend-1.onrender.com
//https://propertyapi.aileadgenie.cloud/api
//https://apidomain.ibigdata.in
//https://apiedu.ibigdata.in
//https://apiwbh.ibigdata.in
//https://apiproperty.ibigdata.in
//https://apitravel.ibigdata.in
//https://apiairbnb.ibigdata.in

export const API_ROUTES = {
  CONTACT: {
    GET_ALL: `${BASE_URL}/contact`,
    GET_BY_ID: (id: string) => `${BASE_URL}/contact/${id}`,
    GET_BY_PARAMS: (params: string) => `${BASE_URL}/contact?${params}`,
    ADD: `${BASE_URL}/contact`,
    UPDATE: (id: string) => `${BASE_URL}/contact/${id}`,
    DELETE: (id: string) => `${BASE_URL}/contact/${id}`,
    DELETEALL: `${BASE_URL}/contact/delete/all`,
    CONTACTIMPORT: `${BASE_URL}/contact/import`,
    CONTACTEXCELHEADERS: `${BASE_URL}/contact/import/headers`,
    ASSIGNCONTACT: `${BASE_URL}/contact/assign`
  },
  CUSTOMER: {
    GET_ALL: `${BASE_URL}/customer`,
    GET_FAVOURITES_CUSTOMER: `${BASE_URL}/customer/favouriteS/all`,
    GET_TODAY_ALL: `${BASE_URL}/customer/today`,
    GET_BY_ID: (id: string) => `${BASE_URL}/customer/${id}`,
    GET_BY_PARAMS: (params: string) => `${BASE_URL}/customer?${params}`,
    CHECKDUPLICATES: `${BASE_URL}/customer/check-duplicates`,
    ADD: `${BASE_URL}/customer`,
    UPDATE: (id: string) => `${BASE_URL}/customer/${id}`,
    DELETE: (id: string) => `${BASE_URL}/customer/${id}`,
    DELETEALL: `${BASE_URL}/customer`,
    CUSTOMERIMPORT: `${BASE_URL}/customer/import`,
    CUSTOMEREXCELHEADERS: `${BASE_URL}/customer/import/headers`,
    ASSIGNCUSTOMER: `${BASE_URL}/customer/assign`,
    QUALIFYCUSTOMER: `${BASE_URL}/customer/qualification-agent`,
    DATAMINING: `${BASE_URL}/customer/data-mining`,
    RECOMENDCUSTOMER: `${BASE_URL}/customer/recommended-customers`,
    AGENTCALLING: `${BASE_URL}/customer/agent-call`,
    GETCALLLOGS: `${BASE_URL}/customer/getcalllogs`,
    GETCALLREPORT: `${BASE_URL}/customer/get-call-report`,
    DELETECALLLOG: (id: string) => `${BASE_URL}/customer/delete-calllog/${id}`,
  },
  COMPANYPROJECTS: {
    GET_ALL: `${BASE_URL}/com/pro`,
    GET_BY_ID: (id: string) => `${BASE_URL}/com/pro/${id}`,
    GET_BY_PARAMS: (params: string) => `${BASE_URL}/com/pro?${params}`,
    ADD: `${BASE_URL}/com/pro`,
    UPDATE: (id: string) => `${BASE_URL}/com/pro/${id}`,
    DELETE: (id: string) => `${BASE_URL}/com/pro/${id}`,
  },
  FOLLOWUPS: {
    CUSTOMER: {
      GET_ALL: `${BASE_URL}/cus/followup`,
      GET_CUSTOMER_FOLLOWUP: (id: string) => `${BASE_URL}/cus/followup/customer/${id}`,
      GET_FOLLOWUP_By_ID: (id: string) => `${BASE_URL}/cus/followup/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/cus/followup?${params}`,
      ADD: (id: string) => `${BASE_URL}/cus/followup/${id}`,
      UPDATE: (id: string) => `${BASE_URL}/cus/followup/${id}`,
      CUSTOMER_FOLLOWUP_DELETE: (id: string) => `${BASE_URL}/cus/followup/customer/${id}`,
      FOLLOWUP_DELETE: (id: string) => `${BASE_URL}/cus/followup/${id}`,
      ADDAIFOLLOWUP: `${BASE_URL}/cus/followup/aifollowup`,
    },
    CONTACT: {
      GET_ALL: `${BASE_URL}/con/follow/add`,
      GET_CONTACT_FOLLOWUP: (id: string) => `${BASE_URL}/con/follow/add/contact/${id}`,
      GET_FOLLOWUP_By_ID: (id: string) => `${BASE_URL}/con/follow/add/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/con/follow/add?${params}`,
      ADD: (id: string) => `${BASE_URL}/con/follow/add/${id}`,
      UPDATE: (id: string) => `${BASE_URL}/con/follow/add/${id}`,
      CONTACT_FOLLOWUP_DELETE: (id: string) => `${BASE_URL}/con/follow/add/contact/${id}`,
      FOLLOWUP_DELETE: (id: string) => `${BASE_URL}/con/follow/add/${id}`,
    },
  },
  SHEDULES: {
    GET_ALL: `${BASE_URL}/sch`,
    GET_BY_ID: (id: string) => `${BASE_URL}/sch/${id}`,
    GET_BY_PARAMS: (params: string) => `${BASE_URL}/sch?${params}`,
    ADD: `${BASE_URL}/sch`,
    UPDATE: (id: string) => `${BASE_URL}/sch/${id}`,
    DELETE: `${BASE_URL}/sch`,
  },
  TASK: {
    GET_ALL: `${BASE_URL}/task`,
    GET_BY_ID: (id: string) => `${BASE_URL}/task/${id}`,
    GET_BY_PARAMS: (params: string) => `${BASE_URL}/task?${params}`,
    ADD: `${BASE_URL}/task`,
    UPDATE: (id: string) => `${BASE_URL}/task/${id}`,
    DELETE: `${BASE_URL}/task`,
  },
  AIAGENT: {
    GET_ALL: `${BASE_URL}/aiagent`,
    GET_BY_ID: (id: string) => `${BASE_URL}/aiagent/${id}`,
    GET_BY_PARAMS: (params: string) => `${BASE_URL}/aiagent?${params}`,
    ADD: `${BASE_URL}/aiagent`,
    UPDATE: (id: string) => `${BASE_URL}/aiagent/${id}`,
    DELETE: (id: string) => `${BASE_URL}/aiagent/${id}`,
    ASSIGNAIAGENT: `${BASE_URL}/aiagent/assign`,
  },
  SOCIALCONTENT: {
    REDDIT: {
      GET_BY_QUERY: (query: string) => `${BASE_URL}/social-content/reddit/${query}`,
    },
    FACEBOOK: {
      GET_ALL_POST: `${BASE_URL}/social-content/facebook`,
      GET_BY_QUERY: (query: string) => `${BASE_URL}/social-content/facebook/${query}`,
      SCRAPP_NEW_POSTS: `${BASE_URL}/social-content/facebook/scrap-new`
    },
    INSTAGRAM: {
      GET_ALL_POST: `${BASE_URL}/social-content/instagram`,
      GET_BY_QUERY: (query: string) => `${BASE_URL}/social-content/instagram/${query}`,
      SCRAPP_NEW_POSTS: `${BASE_URL}/social-content/instagram/scrap-new`
    },
    MINEDLEAD: {
      SAVE: `${BASE_URL}/social-content/minedlead/save`,
      GET: `${BASE_URL}/social-content/minedlead/get`,
      GET_BY_QUERY: (params: string) => `${BASE_URL}/social-content/minedlead/get?${params}`,
      CONVERT:`${BASE_URL}/social-content/minedlead/convert`,
    }
  },
  MASTERS: {
    CAMPAIGN: {
      GET_ALL: `${BASE_URL}/mas/cam`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/cam/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/cam?${params}`,
      ADD: `${BASE_URL}/mas/cam`,
      UPDATE: (id: string) => `${BASE_URL}/mas/cam/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/cam/${id}`,
    },
    TYPES: {
      GET_ALL: `${BASE_URL}/mas/type`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/type/${id}`,
      GET_ALL_BY_CAMPAIGN: (id: string) => `${BASE_URL}/mas/type/campaign/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/type?${params}`,
      ADD: `${BASE_URL}/mas/type`,
      UPDATE: (id: string) => `${BASE_URL}/mas/type/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/type/${id}`,
      DELETEALL: `${BASE_URL}/mas/type`,
    },
    SUBTYPE: {
      GET_ALL: `${BASE_URL}/mas/sub`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/sub/${id}`,
      GET_ALL_BY_CAMPAIGN_AND_TYPE: (campaignid: string, typeid: string) => `${BASE_URL}/mas/sub/filter/${campaignid}/${typeid}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/sub?${params}`,
      ADD: `${BASE_URL}/mas/sub`,
      UPDATE: (id: string) => `${BASE_URL}/mas/sub/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/sub/${id}`,
      DELETEALL: `${BASE_URL}/mas/sub`,
    },
    CITY: {
      GET_ALL: `${BASE_URL}/mas/city`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/city/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/city?${params}`,
      ADD: `${BASE_URL}/mas/city`,
      UPDATE: (id: string) => `${BASE_URL}/mas/city/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/city/${id}`,
    },
    LOCATION: {
      GET_ALL: `${BASE_URL}/mas/loc`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/loc/${id}`,
      GET_ALL_BY_CITY: (id: string) => `${BASE_URL}/mas/loc/city/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/loc?${params}`,
      ADD: `${BASE_URL}/mas/loc`,
      UPDATE: (id: string) => `${BASE_URL}/mas/loc/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/loc/${id}`,
      DELETEALL: `${BASE_URL}/mas/loc`,
    },
    SUBLOCATION: {
      GET_ALL: `${BASE_URL}/mas/subloc`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/subloc/${id}`,
      GET_ALL_BY_CITY_LOCATION: (cityId: string, locationId: string) => `${BASE_URL}/mas/subloc/cityloc/${cityId}/${locationId}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/subloc?${params}`,
      ADD: `${BASE_URL}/mas/subloc`,
      UPDATE: (id: string) => `${BASE_URL}/mas/subloc/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/subloc/${id}`,
      DELETEALL: `${BASE_URL}/mas/subloc`,
    },
    FACILITIES: {
      GET_ALL: `${BASE_URL}/mas/fac`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/fac/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/fac?${params}`,
      ADD: `${BASE_URL}/mas/fac`,
      UPDATE: (id: string) => `${BASE_URL}/mas/fac/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/fac/${id}`,
    },
    AMENITIES: {
      GET_ALL: `${BASE_URL}/mas/amen`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/amen/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/amen?${params}`,
      ADD: `${BASE_URL}/mas/amen`,
      UPDATE: (id: string) => `${BASE_URL}/mas/amen/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/amen/${id}`,
    },
    BUILDERSLIDERS: {
      GET_ALL: `${BASE_URL}/mas/buil`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/buil/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/buil?${params}`,
      ADD: `${BASE_URL}/mas/buil`,
      UPDATE: (id: string) => `${BASE_URL}/mas/buil/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/buil/${id}`,
    },
    FUNCTIONALAREA: {
      GET_ALL: `${BASE_URL}/mas/func`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/func/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/func?${params}`,
      ADD: `${BASE_URL}/mas/func`,
      UPDATE: (id: string) => `${BASE_URL}/mas/func/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/func/${id}`,
    },
    INDUSTRIES: {
      GET_ALL: `${BASE_URL}/mas/ind`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/ind/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/ind?${params}`,
      ADD: `${BASE_URL}/mas/ind`,
      UPDATE: (id: string) => `${BASE_URL}/mas/ind/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/ind/${id}`,
    },
    ROLE: {
      GET_ALL: `${BASE_URL}/mas/role`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/role/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/role?${params}`,
      ADD: `${BASE_URL}/mas/role`,
      UPDATE: (id: string) => `${BASE_URL}/mas/role/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/role/${id}`,
    },
    CONTACTCAMPAIGN: {
      GET_ALL: `${BASE_URL}/mas/contactcampaign`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/contactcampaign/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/contactcampaign?${params}`,
      ADD: `${BASE_URL}/mas/contactcampaign`,
      UPDATE: (id: string) => `${BASE_URL}/mas/contactcampaign/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/contactcampaign/${id}`,
    },
    CONTACTTYPE: {
      GET_ALL: `${BASE_URL}/mas/contacttype`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/contacttype/${id}`,
      GET_ALL_BY_CAMPAIGN: (id: string) => `${BASE_URL}/mas/contacttype/campaign/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/contacttype?${params}`,
      ADD: `${BASE_URL}/mas/contacttype`,
      UPDATE: (id: string) => `${BASE_URL}/mas/contacttype/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/contacttype/${id}`,
    },
    REFERENCES: {
      GET_ALL: `${BASE_URL}/mas/ref`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/ref/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/ref?${params}`,
      ADD: `${BASE_URL}/mas/ref`,
      UPDATE: (id: string) => `${BASE_URL}/mas/ref/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/ref/${id}`,
    },
    LEADTYPE: {
      GET_ALL: `${BASE_URL}/mas/leadtype`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/leadtype/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/leadtype?${params}`,
      ADD: `${BASE_URL}/mas/leadtype`,
      UPDATE: (id: string) => `${BASE_URL}/leadtype/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/leadtype/${id}`,
    },
    PRICE: {
      GET_ALL: `${BASE_URL}/mas/price`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/price/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/price?${params}`,
      ADD: `${BASE_URL}/mas/price`,
      UPDATE: (id: string) => `${BASE_URL}/mas/price/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/price/${id}`,
    },
    CUSTOMERFIELDS: {
      GET_ALL: `${BASE_URL}/mas/customerFields`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/customerFields/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/customerFields?${params}`,
      ADD: `${BASE_URL}/mas/customerFields`,
      UPDATE: (id: string) => `${BASE_URL}/mas/customerFields/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/customerFields/${id}`,
    },

    // 🔹 NEW MASTER MODULES ADDED BELOW 🔹
    EXPENSES: {
      GET_ALL: `${BASE_URL}/mas/exp`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/exp/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/exp?${params}`,
      ADD: `${BASE_URL}/mas/exp`,
      UPDATE: (id: string) => `${BASE_URL}/mas/exp/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/exp/${id}`,
    },
    INCOME: {
      GET_ALL: `${BASE_URL}/mas/inc`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/inc/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/inc?${params}`,
      ADD: `${BASE_URL}/mas/inc`,
      UPDATE: (id: string) => `${BASE_URL}/mas/inc/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/inc/${id}`,
    },
    STATUSTYPE: {
      GET_ALL: `${BASE_URL}/mas/statustype`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/statustype/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/statustype?${params}`,
      ADD: `${BASE_URL}/mas/statustype`,
      UPDATE: (id: string) => `${BASE_URL}/mas/statustype/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/statustype/${id}`,
    },
    CONTACTSTATUSTYPE: {
      GET_ALL: `${BASE_URL}/mas/con/statustype`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/con/statustype/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/con/statustype?${params}`,
      ADD: `${BASE_URL}/mas/con/statustype`,
      UPDATE: (id: string) => `${BASE_URL}/mas/con/statustype/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/con/statustype/${id}`,
    },
    PAYMENTS: {
      GET_ALL: `${BASE_URL}/mas/payments`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/payments/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/payments?${params}`,
      ADD: `${BASE_URL}/mas/payments`,
      UPDATE: (id: string) => `${BASE_URL}/mas/payments/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/payments/${id}`,
    },
    SMS: {
      GET_ALL: `${BASE_URL}/mas/sms`,
      GET_BY_ID: (id: string) => `${BASE_URL}/mas/sms/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/mas/sms?${params}`,
      ADD: `${BASE_URL}/mas/sms`,
      UPDATE: (id: string) => `${BASE_URL}/mas/sms/${id}`,
      DELETE: (id: string) => `${BASE_URL}/mas/sms/${id}`,
    },
    MAIL: {
      GET_ALL: `${BASE_URL}/v1/templates?type=email`,
      GET_BY_ID: (id: string) => `${BASE_URL}/v1/templates/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/v1/templates?${params}`,
      ADD: `${BASE_URL}/v1/templates`,
      UPDATE: (id: string) => `${BASE_URL}/v1/templates/${id}`,
      DELETE: (id: string) => `${BASE_URL}/v1/templates/${id}`,
      MAILALL: `${BASE_URL}/v1/messages/email`
    },
    WHATSAPP: {
      GET_ALL: `${BASE_URL}/v1/templates?type=whatsapp`,
      GET_BY_ID: (id: string) => `${BASE_URL}/v1/templates/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/v1/templates?${params}`,
      ADD: `${BASE_URL}/v1/templates`,
      UPDATE: (id: string) => `${BASE_URL}/v1/templates/${id}`,
      DELETE: (id: string) => `${BASE_URL}/v1/templates/${id}`,
      WHATSAPPALL: `${BASE_URL}/v1/messages/whatsapp`
    },
    CALL: {
      CALLCUSTOMER: `${BASE_URL}/v1/messages/call`
    }
  },
  SETTINGS: {
    CUSTOMERFIELDLABEL: {
      GET_ALL: `${BASE_URL}/customerfieldlabels`,
      UPDATE: `${BASE_URL}/customerfieldlabels`,
    }
  },
  FINANCIAL: {
    INCOMEMARKETING: {
      GET_ALL: `${BASE_URL}/fin/inc`,
      GET_BY_ID: (id: string) => `${BASE_URL}/fin/inc/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/fin/inc?${params}`,
      ADD: `${BASE_URL}/fin/inc`,
      UPDATE: (id: string) => `${BASE_URL}/fin/inc/${id}`,
      DELETE: (id: string) => `${BASE_URL}/fin/inc/${id}`,
    },
    EXPENSEMARKETING: {
      GET_ALL: `${BASE_URL}/fin/exp`,
      GET_BY_ID: (id: string) => `${BASE_URL}/fin/exp/${id}`,
      GET_BY_PARAMS: (params: string) => `${BASE_URL}/fin/exp?${params}`,
      ADD: `${BASE_URL}/fin/exp`,
      UPDATE: (id: string) => `${BASE_URL}/fin/exp/${id}`,
      DELETE: (id: string) => `${BASE_URL}/fin/exp/${id}`,
    }
  },
  FAVOURITES: {
    GET_ALL: `${BASE_URL}/favourites`,
    GET_BY_ID: (id: string) => `${BASE_URL}/favourites/${id}`,
    GET_BY_PARAMS: (params: string) => `${BASE_URL}/favourites?${params}`,
    ADD: `${BASE_URL}/favourites`,
    UPDATE: (id: string) => `${BASE_URL}/favourites/${id}`,
    DELETE: (id: string) => `${BASE_URL}/favourites/${id}`,
  },


  ADMIN: {
    // 🔓 Public Routes
    SIGNUP: `${BASE_URL}/admin/signup`,
    LOGIN: `${BASE_URL}/admin/login`,
    LOGOUT: `${BASE_URL}/admin/logout`,

    // 🔐 Protected Routes
    CHECK: `${BASE_URL}/admin/check`,

    // 👤 Admin Management
    CREATE: `${BASE_URL}/admin/create`,
    GET_ALL: `${BASE_URL}/admin/all`,
    GET_BY_ID: (id: String) => `${BASE_URL}/admin/${id}`,
    UPDATE_DETAILS: (id: String) => `${BASE_URL}/admin/${id}/details`,
    UPDATE_PASSWORD: (id: String) => `${BASE_URL}/admin/${id}/password`,
    DELETE: (id: String) => `${BASE_URL}/admin/${id}`,
  },

  REQUESTUSER: {
    SIGNUP: `${BASE_URL}/user/newusersignup`,
    GET_ALL: `${BASE_URL}/user/newusers`,
    ACCEPTREQUEST: (id: String) => `${BASE_URL}/user/newusers/${id}`,
    DENYREQUEST: (id: String) => `${BASE_URL}/user/newusers/${id}`
  }
};
