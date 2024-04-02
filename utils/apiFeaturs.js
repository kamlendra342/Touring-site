/* eslint-disable prettier/prettier */
// eslint-disable-next-line camelcase
class API_featurs {
  constructor(query, queryString) {
    this.query = query; //mongoosequery which is buiding here
    this.queryString = queryString; //query string comming from router
  }

  filter() {
    //BUILDING QUERY
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el])

    // 1B) Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryStr));

    // {difficulty:'easy' , duration:{$gte:1000}}
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(',', ' ');
      this.query = this.query.sort(sortBy);
      //sort('price ratingsAverage')  this work first sort on basis of price and then were 2 price are same then it sort those on the basis of ratingAverage
    } else {
      this.query = this.query.sort('CreatedAt');
    }
    return this;
  }

  limitfield() {
    // 3) Fields  that i want show
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replaceAll(',', ' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //negative sign mean not include that field or data;
    }
    return this;
  }

  paginate() {
    const page =
      this.queryString.page * 1 < 1 ? 1 : this.queryString.page * 1 || 1;
    const limit =
      this.queryString.limit * 1 < 1 ? 10 : this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

// eslint-disable-next-line camelcase
module.exports = API_featurs;