export const calculateInsightCount = (newInsight, existingInsight) => {
  let viewCount = newInsight.totalViews;
  let likeCount = newInsight.totalLikes;
  let commentCount = newInsight.totalComments;
  let salesCount = newInsight.totalSales;

  if (existingInsight) {
    viewCount -= existingInsight.totalViews;
    likeCount -= existingInsight.totalLikes;
    commentCount -= existingInsight.totalComments;
    salesCount -= existingInsight.totalSales;
  }

  return {
    viewCount,
    likeCount,
    commentCount,
    salesCount,
  };
};
